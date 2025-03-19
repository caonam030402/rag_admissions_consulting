import streamlit as st
import os
import sys
from pathlib import Path

# Add the src directory to the Python path using pathlib
src_dir = str(Path(__file__).parent.parent.absolute())
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from rag_agent import RagAgent
from llms import LLms
from shared.enum import ModelType
from store import store
from embeddings import embeddings

# Configure the page
st.set_page_config(
    page_title="RAG Admissions Chatbot",
    page_icon="🎓",
    layout="centered"
)

# Initialize chat history manager and session state
from shared.chat_history import ChatHistoryManager

chat_history = ChatHistoryManager()

# Initialize session state for chat history
if 'messages' not in st.session_state:
    st.session_state.messages = []
    # Load saved messages from chat history
    saved_messages = chat_history.load_messages()
    if saved_messages:
        st.session_state.messages = saved_messages

# Initialize RAG components
@st.cache_resource
def initialize_rag_components():
    lmm = LLms.getLLm(ModelType.GEMINI)
    embedding = embeddings.get_embeddings(ModelType.GEMINI)
    
    store.search_kwargs = {"k": 8, "score_threshold": 0.5, "fetch_k": 20}
    store.search_type = "mmr"
    store.search_kwargs["lambda_mult"] = 0.8
    retriever = store.getRetriever(embedding)
    
    return lmm, retriever

# Display chat title
st.title("🎓 Tư vấn tuyển sinh")

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Initialize RAG components
lmm, retriever = initialize_rag_components()

# Chat input
if prompt := st.chat_input("Nhập câu hỏi của bạn..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    chat_history.append_message("user", prompt)
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Get conversation context
    conversation_context = chat_history.get_conversation_context()
    context_messages = [f"{msg['role']}: {msg['content']}" for msg in conversation_context]
    
    # Get bot response
    with st.chat_message("assistant"):
        with st.spinner("Đang tìm kiếm thông tin..."):
            # Include conversation context in the prompt
            full_context = "\n".join(context_messages[-3:]) + "\n" + prompt if context_messages else prompt
            response = RagAgent.answer_question(full_context, lmm, retriever)
            if isinstance(response, dict) and 'answer' in response:
                answer = response['answer'].strip()
                if answer:
                    st.markdown(answer)
                    st.session_state.messages.append({"role": "assistant", "content": answer})
                    chat_history.append_message("assistant", answer)
                else:
                    error_msg = "Xin lỗi, tôi không tìm thấy thông tin phù hợp cho câu hỏi của bạn."
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})
                    chat_history.append_message("assistant", error_msg)