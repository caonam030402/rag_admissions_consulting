from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from prompt import system_prompt

class RagAgent:
    def rag_chain(llm, retriever):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{{question}}"),
            ]
        )
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        return rag_chain
        
    def answer_question(question: str, lmm, retriever):
        return RagAgent.rag_chain(lmm, retriever).invoke({"input": question})