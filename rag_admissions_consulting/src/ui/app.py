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
from shared.enum import RoleType

# Configure the page
st.set_page_config(
    page_title="RAG Admissions Chatbot",
    page_icon="🎓",
    layout="centered"
)

# Initialize chat history manager and session state
from shared.chat_history_db import ChatHistoryManager
from shared.database import setup_database, DatabaseConnection

# Setup database tables
setup_database()

# Initialize session state
if 'user_email' not in st.session_state:
    st.session_state.user_email = None

if 'user_id' not in st.session_state:
    st.session_state.user_id = None

# Email authentication popup
def authenticate_user(email):
    try:
        conn = DatabaseConnection.get_connection()
        cur = conn.cursor()
        
        # Check if user exists, if not create new user
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        result = cur.fetchone()
        
        if result:
            user_id = result[0]
        else:
            cur.execute("INSERT INTO users (email) VALUES (%s) RETURNING id", (email,))
            user_id = cur.fetchone()[0]
            
        conn.commit()
        return user_id
    except Exception as e:
        st.error(f"Error authenticating user: {e}")
        return None
    finally:
        if conn:
            DatabaseConnection.return_connection(conn)

# Show email popup if user is not authenticated
if not st.session_state.user_email:
    with st.form("email_form"):
        email = st.text_input("Please enter your email to continue:")
        submitted = st.form_submit_button("Submit")
        
        if submitted and email:
            user_id = authenticate_user(email)
            if user_id:
                st.session_state.user_email = email
                st.session_state.user_id = user_id
                st.rerun()

# Only show chat interface if user is authenticated
if st.session_state.user_email:
    chat_history = ChatHistoryManager(st.session_state.user_id)

    # Initialize session state for chat history
    if 'messages' not in st.session_state:
        st.session_state.messages = []
        # Load saved messages from chat history
        chat_history.load_messages()
        st.session_state.messages = chat_history.messages

    # Initialize RAG components
    @st.cache_resource
    def initialize_rag_components():
        lmm = LLms.getLLm(ModelType.GEMINI)
        embedding = embeddings.get_embeddings(ModelType.OLLAMA)
        
        store.search_kwargs = {
            "k": 8,
            "score_threshold": 0.5,
            "fetch_k": 20,
            "lambda_mult": 0.8
        }
        store.search_type = "mmr"
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
        st.session_state.messages.append({"role": RoleType.USER, "content": prompt})
        chat_history.append_message(RoleType.USER, prompt)
        with st.chat_message(RoleType.USER):
            st.markdown(prompt)
        
        # Get conversation context
        conversation_context = chat_history.get_conversation_context()
        context_messages = [f"{msg['role']}: {msg['content']}" for msg in conversation_context]
        
        # Get bot response
        with st.chat_message("assistant"):
            with st.spinner("Đang tìm kiếm thông tin..."):
                full_context = "\n".join(context_messages[-3:]) + "\n" + prompt if context_messages else prompt
                response = RagAgent.answer_question(full_context, lmm, retriever)
                if isinstance(response, dict) and 'answer' in response:
                    answer = response['answer'].strip()
                    if answer:
                        st.markdown(answer)
                        st.session_state.messages.append({"role": RoleType.ASSISTANT, "content": answer})
                        chat_history.append_message(RoleType.ASSISTANT, answer)
                    else:
                        error_msg = "Xin lỗi, tôi không tìm thấy thông tin phù hợp cho câu hỏi của bạn."
                        st.error(error_msg)
                        st.session_state.messages.append({"role": RoleType.ASSISTANT, "content": error_msg})
                        chat_history.append_message(RoleType.ASSISTANT, error_msg)