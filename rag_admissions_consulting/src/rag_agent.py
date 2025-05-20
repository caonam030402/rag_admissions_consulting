from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from prompt import system_prompt
from langchain import hub
from functools import lru_cache
from loguru import logger
from ood_agent import OODAgent

# Simple in-memory cache for responses
response_cache = {}


class RagAgent:
    def rag_chain(llm, retriever):
        logger.info("Creating RAG chain with prompt template")
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                (
                    "system",
                    "Here is information that might be relevant to the question:\n\n{context}",
                ),
                ("human", "{input}"),
            ]
        )

        # Not using qa_prompt from hub as it may be causing issues
        logger.info("Creating question_answer_chain")
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        logger.info("Creating retrieval chain")
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        logger.info("RAG chain created successfully")
        return rag_chain

    @staticmethod
    def is_simple_followup(question: str) -> bool:
        """Check if question appears to be a simple follow-up question"""
        question = question.lower().strip()

        # Vietnamese follow-up patterns
        followup_starters = [
            "còn",
            "vậy còn",
            "thế còn",
            "thế",
            "vậy",
            "thế còn",
            "và",
            "còn về",
            "tại sao",
            "vì sao",
            "sao",
            "tại",
            # Short questions
            "như thế nào",
            "khi nào",
            "bao nhiêu",
            "mấy giờ",
            "ai",
            "ở đâu",
            "gì",
            # Single-word queries that need context
            "ok",
            "ừ",
            "vâng",
            "rồi",
            "được",
            "xong",
        ]

        for starter in followup_starters:
            if question.startswith(starter) or question == starter:
                return True

        # If very short, likely a follow-up
        return len(question.split()) <= 3

    @staticmethod
    async def answer_question_stream(
        question: str,
        llm,
        retriever,
        chat_history: list = None,
        ood_agent: OODAgent = None,
    ):
        """Stream responses token by token"""
        logger.info(f"Processing question: {question[:50]}...")

        # Clear the response cache if it grows too large (prevent memory issues)
        if len(response_cache) > 1000:
            logger.info("Clearing response cache (exceeds 1000 entries)")
            response_cache.clear()

        # Check if this is likely a follow-up question that needs context
        is_followup = RagAgent.is_simple_followup(question)
        if is_followup:
            logger.info(f"Detected simple follow-up question: '{question}'")

            # For follow-up questions with minimal context, skip OOD detection
            skip_ood = True
        else:
            skip_ood = False

        # Retrieve documents for OOD detection and RAG processing
        try:
            docs = retriever.get_relevant_documents(question)
            logger.info(f"Retrieved {len(docs)} documents from Pinecone")
            for i, doc in enumerate(docs):
                logger.info(
                    f"Document {i+1} content sample: {doc.page_content[:100]}..."
                )
                logger.info(f"Document {i+1} metadata: {doc.metadata}")

            # Check if the question is out-of-domain
            if ood_agent and not skip_ood:
                is_ood, explanation = ood_agent.is_out_of_domain(question, docs)
                if is_ood:
                    logger.info(f"Question detected as OOD: {explanation}")
                    ood_response = ood_agent.get_ood_response(question)

                    # Cache the OOD response
                    cache_key = question.lower().strip()
                    response_cache[cache_key] = [ood_response]

                    # Return the OOD response token by token
                    for token in ood_response:
                        yield token
                    return

        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            # Continue with empty docs - the chain will handle it

        # Check if question is in cache
        cache_key = question.lower().strip()
        if cache_key in response_cache:
            logger.info("Question found in cache, returning cached response")
            cached_response = response_cache[cache_key]
            # Return the cached response token by token to maintain streaming behavior
            for token in cached_response:
                yield token
            return

        logger.info("Creating RAG chain for streaming response")
        rag_chain = RagAgent.rag_chain(llm, retriever)

        logger.info("Starting streaming response generation")
        response_tokens = []
        try:
            async for token in rag_chain.astream(
                {
                    "input": question,  # Use "input" here as that's what the retrieval chain expects
                    "chat_history": chat_history or [],
                }
            ):
                logger.debug(f"Token received: {token.keys()}")
                if "answer" in token:
                    response_tokens.append(token["answer"])
                    yield token["answer"]

            logger.info(f"Streaming complete, cached {len(response_tokens)} tokens")

            # Cache the response after streaming (only if we have tokens)
            if response_tokens:
                response_cache[cache_key] = response_tokens

        except Exception as e:
            logger.error(f"Error in streaming response: {str(e)}")
            # Return a simple error message that can be shown to the user
            error_msg = "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn."
            yield error_msg
            response_cache[cache_key] = [error_msg]

    @staticmethod
    def answer_question(
        question: str,
        llm,
        retriever,
        chat_history: list = None,
        ood_agent: OODAgent = None,
    ):
        """Non-streaming version for compatibility"""
        logger.info(f"Processing question (non-streaming): {question[:50]}...")

        # Check if this is likely a follow-up question that needs context
        is_followup = RagAgent.is_simple_followup(question)
        if is_followup:
            logger.info(f"Detected simple follow-up question: '{question}'")
            # For follow-up questions with minimal context, skip OOD detection
            skip_ood = True
        else:
            skip_ood = False

        # Check cache first
        cache_key = question.lower().strip()
        if cache_key in response_cache:
            logger.info("Question found in cache, returning cached response")
            cached_answer = "".join(response_cache[cache_key])
            return {
                "answer": cached_answer,
                "updated_history": (chat_history or [])
                + [{"question": question, "answer": cached_answer}],
            }

        # Retrieve documents for OOD detection
        try:
            docs = retriever.get_relevant_documents(question)
            logger.info(f"Retrieved {len(docs)} documents from Pinecone")

            # Check if the question is out-of-domain
            if ood_agent and not skip_ood:
                is_ood, explanation = ood_agent.is_out_of_domain(question, docs)
                if is_ood:
                    logger.info(f"Question detected as OOD: {explanation}")
                    ood_response = ood_agent.get_ood_response(question)

                    # Cache the OOD response
                    response_cache[cache_key] = [ood_response]

                    return {
                        "answer": ood_response,
                        "updated_history": (chat_history or [])
                        + [{"question": question, "answer": ood_response}],
                    }
        except Exception as e:
            logger.error(f"Error in OOD detection: {str(e)}")
            # Continue with normal processing

        logger.info("Creating RAG chain for non-streaming response")
        try:
            rag_chain = RagAgent.rag_chain(llm, retriever)

            logger.info("Invoking RAG chain")
            response = rag_chain.invoke(
                {
                    "input": question,  # Use "input" here as that's what the retrieval chain expects
                    "chat_history": chat_history or [],
                }
            )

            logger.info("Response received, caching")
            # Cache the response
            response_cache[cache_key] = [response["answer"]]

            return {
                "answer": response["answer"],
                "updated_history": (chat_history or [])
                + [{"question": question, "answer": response["answer"]}],
            }
        except Exception as e:
            logger.error(f"Error in non-streaming response: {str(e)}")
            error_msg = "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn."
            response_cache[cache_key] = [error_msg]
            return {
                "answer": error_msg,
                "updated_history": (chat_history or [])
                + [{"question": question, "answer": error_msg}],
            }
