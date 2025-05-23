from typing import List, Dict, Any

system_prompt = """Bạn là trợ lý tư vấn tuyển sinh, với các quy tắc NGHIÊM NGẶT sau:

NGUYÊN TẮC CỐT LÕI:
1. CHỈ sử dụng thông tin có trong dữ liệu được cung cấp
2. LUÔN trả lời bằng tiếng Việt
3. TUYỆT ĐỐI KHÔNG suy luận hoặc thêm thông tin ngoài dữ liệu
4. Nếu không có thông tin, trả lời: "Xin lỗi, tôi không tìm thấy thông tin về vấn đề này trong dữ liệu hiện có."

CÁCH TRẢ LỜI:
1. Độ Chính Xác:
- Chỉ trích dẫn thông tin có trong dữ liệu
- Không đưa ra phỏng đoán hoặc giả định
- Thừa nhận khi thiếu thông tin

2. Cấu Trúc Trả Lời:
- Ngắn gọn, rõ ràng, dễ hiểu
- Sử dụng gạch đầu dòng cho nhiều điểm
- Nhấn mạnh thông tin quan trọng bằng in đậm

3. Ngôn Ngữ:
- Chỉ sử dụng tiếng Việt
- Thân thiện, lịch sự
- Tránh từ ngữ phức tạp

4. Xử Lý Khi Thiếu Thông Tin:
- Nói rõ phần nào không có thông tin
- Không đưa ra gợi ý nếu không có trong dữ liệu
- Không chuyển hướng sang thông tin không liên quan

LUÔN NHỚ: Mục tiêu là cung cấp thông tin CHÍNH XÁC từ dữ liệu, bằng tiếng Việt, không thêm bớt."""

def create_qa_prompt(
    question: str,
    context: str,
    chat_history: List[Dict[str, str]] = None,
    user_preferences: Dict[str, Any] = None
) -> str:
    """Create a context-aware prompt for question answering."""
    
    # Format chat history if available
    history_str = ""
    if chat_history and len(chat_history) > 0:
        history_str = "\nLịch sử hội thoại gần đây:\n" + "\n".join(
            [f"Người dùng: {msg['question']}\nTrợ lý: {msg['answer']}" 
             for msg in chat_history[-3:]]
        )
    
    # Format user preferences if available
    preferences_str = ""
    if user_preferences and len(user_preferences) > 0:
        preferences_str = "\nThông tin người dùng:\n" + "\n".join(
            [f"- {k}: {v}" for k, v in user_preferences.items()]
        )
    
    prompt = f"""Dựa trên thông tin được cung cấp dưới đây:

Dữ liệu:
{context}
{history_str}
{preferences_str}

Câu hỏi: {question}

Hãy trả lời câu hỏi trên theo đúng các nguyên tắc đã nêu:
1. CHỈ sử dụng thông tin từ dữ liệu được cung cấp
2. LUÔN trả lời bằng tiếng Việt
3. Nếu không có thông tin, nói rõ điều đó
4. KHÔNG thêm thông tin ngoài dữ liệu"""
    
    return prompt

def create_rewrite_query_prompt(
    question: str,
    chat_history: List[Dict[str, str]] = None
) -> str:
    """Create a prompt to rewrite the query for better semantic search."""
    
    history_context = ""
    if chat_history and len(chat_history) > 0:
        recent_history = chat_history[-3:]
        history_context = "Dựa trên lịch sử hội thoại:\n" + "\n".join(
            [f"Người dùng: {msg['question']}\nTrợ lý: {msg['answer']}" 
             for msg in recent_history]
        )
    
    prompt = f"""{history_context}

Câu hỏi: "{question}"

Hãy viết lại câu hỏi trên bằng tiếng Việt để tối ưu cho tìm kiếm, đảm bảo:
1. Giữ nguyên ý nghĩa gốc
2. Sử dụng từ khóa quan trọng
3. Mở rộng từ viết tắt
4. Thêm từ đồng nghĩa phổ biến
5. Bỏ từ không cần thiết

Chỉ trả về câu hỏi đã viết lại, không giải thích."""
    
    return prompt

def create_ood_detection_prompt(question: str, retrieved_docs: List[str]) -> str:
    """Create a prompt to detect out-of-domain questions."""
    
    docs_context = "\n---\n".join(retrieved_docs)
    
    prompt = f"""Câu hỏi: "{question}"

Các tài liệu liên quan:
{docs_context}

Đánh giá xem câu hỏi có nằm ngoài phạm vi dữ liệu không:
1. So sánh nội dung câu hỏi với dữ liệu
2. Kiểm tra độ liên quan của tài liệu
3. Đánh giá mức độ phù hợp

Trả về định dạng JSON:
{{
    "is_ood": true/false,
    "explanation": "Lý do bằng tiếng Việt"
}}"""
    
    return prompt
