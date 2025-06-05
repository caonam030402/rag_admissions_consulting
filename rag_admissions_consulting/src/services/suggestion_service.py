from typing import List, Dict, Any
from loguru import logger

from core.app_manager import app_manager
from infrastructure.llms import LLms
from shared.enum import ModelType


class SuggestionService:
    """Service to generate intelligent follow-up question suggestions"""

    def __init__(self):
        """Initialize suggestion service with LLM"""
        # Use RAG engine's LLM which is already initialized
        try:
            if app_manager.is_initialized():
                # Get RAG engine and use its LLM
                rag_engine = app_manager.get_rag_engine()
                self.llm = rag_engine.llm
                logger.info("Using LLM from RAG engine for suggestions")
            else:
                # Create LLM directly as fallback
                self.llm = LLms().getLLm(ModelType.GEMINI)
                logger.info("Created new LLM for suggestions")
        except Exception as e:
            logger.error(f"Failed to get LLM: {e}")
            # Final fallback
            try:
                self.llm = LLms().getLLm(ModelType.GEMINI)
                logger.info("Fallback: Created new LLM for suggestions")
            except Exception as e2:
                logger.error(f"Failed to create fallback LLM: {e2}")
                self.llm = None

    async def generate_suggestions(
        self, conversation_id: str, recent_messages: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate contextual follow-up questions based on conversation history"""

        # If LLM not available, use fallback immediately
        if self.llm is None:
            logger.warning("LLM not available, using fallback suggestions")
            return self._get_fallback_suggestions(recent_messages)

        try:
            # Build context from recent messages
            context = self._build_context(recent_messages)

            # Create prompt for generating suggestions
            prompt = self._create_suggestion_prompt(context)

            # Generate suggestions using LLM
            response = await self.llm.ainvoke(prompt)

            # Parse and format suggestions
            suggestions = self._parse_suggestions(response.content)

            logger.info(
                f"Generated {len(suggestions)} AI suggestions for conversation {conversation_id}"
            )
            return suggestions

        except Exception as e:
            logger.error(f"Error generating AI suggestions: {e}")
            return self._get_fallback_suggestions(recent_messages)

    def _build_context(self, recent_messages: List[Dict[str, Any]]) -> str:
        """Build conversation context from recent messages"""
        if not recent_messages:
            return "Cuộc trò chuyện mới về tư vấn tuyển sinh."

        # Use last 5 messages for better context
        context_parts = []
        for msg in recent_messages[-5:]:
            role = "Người dùng" if msg.get("role") == "user" else "Tư vấn viên"
            content = msg.get("content", "")
            context_parts.append(f"{role}: {content}")

        return "\n".join(context_parts)

    def _create_suggestion_prompt(self, context: str) -> str:
        """Create prompt for generating follow-up questions"""
        return f"""Bạn là AI tư vấn tuyển sinh đại học. Dựa trên cuộc trò chuyện, hãy đề xuất 4 câu hỏi ngắn gọn bên phía người hỏi:

Cuộc trò chuyện:
{context}

Hãy tạo 4 câu hỏi NGẮN GỌN bằng tiếng Việt (tối đa 4-6 từ mỗi câu):
- Về ngành học, điểm chuẩn, học phí, cơ hội việc làm

Yêu cầu:
- MỖI CÂU TỐI ĐA 4-6 TỪ
- Phù hợp với ngữ cảnh
- Mỗi câu một dòng
- Không đánh số, không dấu gạch đầu dòng
- Bằng tiếng Việt
- Xem xét nếu người dùng đang gặp khó khăn trong việc hỏi hoặc trong đoạn chat có đề cập tôi muốn gặp cán bộ tư vấn thì trả về câu (chat ngay cán bộ tư vấn)
Ví dụ format:
Điểm chuẩn ngành nào?
Học phí bao nhiêu?
Cơ hội việc làm?

Câu hỏi ngắn:"""

    def _parse_suggestions(self, response_content: str) -> List[str]:
        """Parse LLM response to extract suggestions"""
        try:
            lines = response_content.strip().split("\n")
            suggestions = []

            for line in lines:
                line = line.strip()
                if line and len(line) > 8:  # Skip very short lines
                    # Clean up prefixes
                    line = line.lstrip("- •123456789.() ")

                    # Accept Vietnamese questions (with or without ?)
                    # Prioritize shorter questions (under 50 characters)
                    if (
                        line
                        and len(line) <= 50
                        and (
                            "?" in line
                            or any(
                                word in line.lower()
                                for word in [
                                    "như thế nào",
                                    "là gì",
                                    "có",
                                    "được",
                                    "thể",
                                    "nào",
                                    "sao",
                                    "bao nhiêu",
                                    "khi nào",
                                    "ở đâu",
                                ]
                            )
                        )
                    ):
                        suggestions.append(line)
                        if len(suggestions) >= 4:  # Stop at 4 suggestions
                            break

            # Return suggestions or fallback
            return suggestions[:4] if suggestions else self._get_default_suggestions()

        except Exception as e:
            logger.error(f"Error parsing suggestions: {e}")
            return self._get_default_suggestions()

    def _get_fallback_suggestions(
        self, recent_messages: List[Dict[str, Any]]
    ) -> List[str]:
        """Get fallback suggestions when LLM fails - simplified and shorter"""
        if not recent_messages:
            return self._get_default_suggestions()

        # Get last user message content only for speed
        last_user_content = ""
        for msg in reversed(recent_messages[-3:]):  # Check only last 3 messages
            if msg.get("role") == "user":
                last_user_content = msg.get("content", "").lower()
                break

        # Quick keyword check for major fields only - shorter suggestions
        if any(
            keyword in last_user_content
            for keyword in ["cntt", "it", "công nghệ thông tin", "lập trình"]
        ):
            return [
                "Môn học CNTT?",
                "Việc làm IT?",
                "Học phí bao nhiêu?",
                "Điểm chuẩn?",
            ]

        if any(
            keyword in last_user_content
            for keyword in ["du lịch", "tourism", "ngoại ngữ"]
        ):
            return [
                "Chương trình Du lịch?",
                "Thực tập ở đâu?",
                "Yêu cầu ngoại ngữ?",
                "Cơ hội nghề nghiệp?",
            ]

        if any(
            keyword in last_user_content
            for keyword in ["kinh tế", "quản trị", "marketing"]
        ):
            return [
                "Chuyên ngành Kinh tế?",
                "Thực tập doanh nghiệp?",
                "Lương khởi điểm?",
                "Điều kiện đầu vào?",
            ]

        # Default for all other cases
        return self._get_default_suggestions()

    def _get_default_suggestions(self) -> List[str]:
        """Get default suggestions for general admission consulting - short and concise"""
        return [
            "Điều kiện đầu vào?",
            "Quy trình nộp hồ sơ?",
            "Học phí và học bổng?",
            "Cơ hội việc làm?",
        ]
