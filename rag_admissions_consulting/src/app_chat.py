from rag_agent import RagAgent
from llms import LLms
from shared.enum import ModelType
from store import store
from embeddings import embeddings


def app_chat():
    question = "Chương trình đạo tạo ngành CNTT cụ thể chi tiết nhất"
    lmm = LLms.getLLm(ModelType.GEMINI)
    # Use GEMINI embeddings for better Vietnamese language support
    embedding = embeddings.get_embeddings(ModelType.OLLAMA)
    
    store.search_kwargs = {"k": 8, "score_threshold": 0.5, "fetch_k": 20}
    store.search_type = "mmr"
    store.search_kwargs["lambda_mult"] = 0.8  
    retriever = store.getRetriever(embedding)
    
    response = RagAgent.answer_question(question, lmm, retriever)
    if isinstance(response, dict) and 'answer' in response:
        answer = response['answer'].strip()
        if answer:
            print(answer)
        else:
            print("Xin lỗi, tôi không tìm thấy thông tin phù hợp cho câu hỏi của bạn.")
    else:
        print("Error: Unexpected response format")
    return response

if __name__ == "__main__":
    app_chat()