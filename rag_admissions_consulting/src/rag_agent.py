from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from prompt import system_prompt
from langchain import hub

class RagAgent:
    def rag_chain(llm, retriever):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{{question}}"),
            ]
        )
        qa_prompt = hub.pull("bagumeow/qa-tuyensinh") 
        
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        return rag_chain
        
    @staticmethod
    async def answer_question_stream(question: str, llm, retriever, chat_history: list = None):
        """Stream responses token by token"""
        response_tokens = []
        async for token in RagAgent.rag_chain(llm, retriever).astream({
            "input": question,
            "chat_history": chat_history or [],
            "context": ""
        }):
            if 'answer' in token:
                response_tokens.append(token['answer'])
                yield token['answer']
        
        # No return statement in async generator
        # The final response is handled by the caller

    @staticmethod
    def answer_question(question: str, llm, retriever, chat_history: list = None):
        """Non-streaming version for compatibility"""
        response = RagAgent.rag_chain(llm, retriever).invoke({
            "input": question,
            "chat_history": chat_history or [],
            "context": ""
        })

        return {
            'answer': response['answer'],
            'updated_history': (chat_history or []) + [
                {'question': question, 'answer': response['answer']}
            ]
        }