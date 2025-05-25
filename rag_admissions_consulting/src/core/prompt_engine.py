from typing import List, Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from loguru import logger


class PromptEngine:
    """Intelligent prompt engine for context-aware responses"""

    def __init__(self):
        self.base_system_prompt = """
Bạn là một chuyên viên tư vấn tuyển sinh thông minh, chuyên nghiệp và thân thiện của Trường Đại học Đông Á. 
Bạn có khả năng hiểu ngữ cảnh cuộc trò chuyện và đưa ra những câu trả lời chính xác, hữu ích.

🎯 **Nhiệm vụ chính**:
- Tư vấn chính xác về tuyển sinh, ngành học, học phí, học bổng và mọi thông tin liên quan đến trường
- Hiểu và sử dụng ngữ cảnh cuộc trò chuyện để đưa ra câu trả lời phù hợp
- Luôn dựa vào thông tin chính thức từ dữ liệu được cung cấp

📌 **Nguyên tắc trả lời**:
1. **Ngữ cảnh**: Luôn xem xét ngữ cảnh cuộc trò chuyện trước đó để hiểu đúng ý định của người hỏi
2. **Chính xác**: Chỉ sử dụng thông tin có trong dữ liệu được cung cấp
3. **Thân thiện**: Giọng văn ấm áp, chuyên nghiệp nhưng gần gũi
4. **Cụ thể**: Đưa ra thông tin chi tiết, có cấu trúc rõ ràng
5. **Hướng dẫn**: Luôn sẵn sàng hướng dẫn bước tiếp theo hoặc cung cấp thông tin liên hệ khi cần

🚫 **Không được**:
- Phỏng đoán thông tin không có trong dữ liệu
- Bỏ qua ngữ cảnh cuộc trò chuyện
- Trả lời máy móc, thiếu cảm xúc
"""

        self.specialized_prompts = {
            "specific_program": """
Đây là câu hỏi về chương trình đào tạo cụ thể. Hãy tập trung vào:
- Thông tin chi tiết về ngành/chuyên ngành
- Cơ hội nghề nghiệp sau tốt nghiệp
- Điều kiện đầu vào và yêu cầu học tập
- Cấu trúc chương trình và thời gian đào tạo
""",
            "admission_process": """
Đây là câu hỏi về quy trình tuyển sinh. Hãy tập trung vào:
- Các bước cụ thể trong quy trình xét tuyển
- Thời gian và deadline quan trọng
- Hồ sơ và giấy tờ cần thiết
- Phương thức xét tuyển và điểm chuẩn
""",
            "fees_scholarships": """
Đây là câu hỏi về tài chính. Hãy tập trung vào:
- Mức học phí cụ thể theo từng ngành
- Các loại học bổng và điều kiện nhận
- Hình thức thanh toán và hỗ trợ tài chính
- So sánh chi phí với lợi ích nhận được
""",
            "facilities_campus": """
Đây là câu hỏi về cơ sở vật chất. Hãy tập trung vào:
- Mô tả chi tiết các tiện ích và cơ sở
- Vị trí và cách thức tiếp cận
- Chất lượng và tình trạng hiện tại
- Dịch vụ hỗ trợ sinh viên
""",
            "career_prospects": """
Đây là câu hỏi về triển vọng nghề nghiệp. Hãy tập trung vào:
- Cơ hội việc làm cụ thể sau tốt nghiệp
- Mức lương và điều kiện làm việc
- Các công ty và đối tác tuyển dụng
- Hỗ trợ tìm việc từ trường
""",
            "follow_up": """
Đây là câu hỏi tiếp theo trong cuộc trò chuyện. Hãy:
- Tham khảo thông tin đã thảo luận trước đó
- Bổ sung thêm chi tiết liên quan
- Làm rõ những điểm chưa được giải thích đầy đủ
- Kết nối với ngữ cảnh cuộc trò chuyện
""",
            "clarification": """
Người dùng cần làm rõ thông tin. Hãy:
- Giải thích chi tiết và dễ hiểu
- Đưa ra ví dụ cụ thể nếu cần
- Phân tích từng khía cạnh của vấn đề
- Đảm bảo người dùng hiểu đúng và đầy đủ
""",
        }

    def create_context_aware_prompt(
        self,
        query: str,
        enhanced_query: str,
        context_messages: List[Dict[str, Any]] = None,
        query_analysis: Dict[str, Any] = None,
        relevant_docs: List[Any] = None,
    ) -> ChatPromptTemplate:
        """Create a context-aware prompt based on query analysis and conversation history"""

        # Build system prompt
        system_prompt = self.base_system_prompt

        # Add specialized instructions based on query type
        if query_analysis and query_analysis.get("type") in self.specialized_prompts:
            query_type = query_analysis["type"]
            system_prompt += f"\n\n**Hướng dẫn đặc biệt cho loại câu hỏi này**:\n{self.specialized_prompts[query_type]}"

        # Add context-specific instructions
        if query_analysis and query_analysis.get("context_type"):
            context_type = query_analysis["context_type"]
            if context_type in self.specialized_prompts:
                system_prompt += f"\n\n**Hướng dẫn xử lý ngữ cảnh**:\n{self.specialized_prompts[context_type]}"

        # Add conversation context if available
        if context_messages:
            system_prompt += self._build_conversation_context_prompt(context_messages)

        # Add document context instructions
        system_prompt += """

**Sử dụng thông tin từ tài liệu**:
- Dựa vào thông tin trong {context} để trả lời
- Nếu không tìm thấy thông tin cần thiết, hãy thành thật nói rằng bạn không có thông tin đó
- Luôn ưu tiên thông tin chính thức từ trường
- Có thể tham khảo lịch sử trò chuyện trong {chat_history} để hiểu rõ hơn ngữ cảnh

**Thông tin liên hệ khi cần hỗ trợ thêm**:
📞 Hotline: 0236.3.650.403
📧 Email: tuyensinh@donga.edu.vn
🌐 Website: https://donga.edu.vn
📍 Địa chỉ: 33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng
"""

        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("system", "Thông tin liên quan từ cơ sở dữ liệu:\n{context}"),
                ("system", "Lịch sử cuộc trò chuyện: {chat_history}"),
                ("human", "{input}"),
            ]
        )

        logger.debug(
            f"Created context-aware prompt for query type: {query_analysis.get('type', 'unknown') if query_analysis else 'unknown'}"
        )

        return prompt

    def _build_conversation_context_prompt(
        self, context_messages: List[Dict[str, Any]]
    ) -> str:
        """Build conversation context section for the prompt"""

        if not context_messages:
            return ""

        context_prompt = "\n\n**Ngữ cảnh cuộc trò chuyện**:\n"
        context_prompt += "Hãy xem xét thông tin sau từ cuộc trò chuyện trước đó để hiểu rõ hơn câu hỏi hiện tại:\n\n"

        # Get recent messages (last 6 messages = 3 exchanges)
        recent_messages = (
            context_messages[-6:] if len(context_messages) > 6 else context_messages
        )

        for i, msg in enumerate(recent_messages):
            role_name = "Người dùng" if msg["role"] == "USER" else "Tư vấn viên"
            context_prompt += f"{role_name}: {msg['content']}\n"

        context_prompt += "\nHãy sử dụng ngữ cảnh này để đưa ra câu trả lời phù hợp và có liên kết với cuộc trò chuyện."

        return context_prompt

    def create_simple_prompt(self, query_type: str = "general") -> ChatPromptTemplate:
        """Create a simple prompt for basic queries"""

        system_prompt = self.base_system_prompt

        if query_type in self.specialized_prompts:
            system_prompt += f"\n\n{self.specialized_prompts[query_type]}"

        return ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("system", "Thông tin từ cơ sở dữ liệu: {context}"),
                ("human", "{input}"),
            ]
        )
