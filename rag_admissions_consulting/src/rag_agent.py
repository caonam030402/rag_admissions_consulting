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
        
    def answer_question(question: str, llm, retriever, chat_history: list = None):
        # Process the question with chat history
        response = RagAgent.rag_chain(llm, retriever).invoke({
            "input": question,
            "chat_history": chat_history or [],
            "context": ""
        })
        
        # If no relevant information found in context
        if not response or 'context' not in response or not response['context']:
            return {
                'answer': 'Could you please clarify which specific program or university you are asking about? This will help me provide more accurate information.'
            }
            
        # Validate answer quality
        if 'generic' in response['answer'].lower() or 'sorry' in response['answer'].lower():
            return {
                'answer': 'To better assist you, could you share: 1) Your target universities 2) Academic background 3) Specific concerns?'
            }

        # Update chat history with current interaction
        return {
            'answer': response['answer'],
            'updated_history': (chat_history or []) + [
                {'question': question, 'answer': response['answer']}
            ]
        }
        
        # Structure the response based on the question type and available information
        return response