from typing import List, Dict, Any, Optional
import re
from loguru import logger


class QueryAnalyzer:
    """Analyze user queries to understand intent and improve response quality"""

    def __init__(self):
        # Define query patterns and keywords
        self.query_patterns = {
            "specific_program": {
                "keywords": [
                    "ngành",
                    "chuyên ngành",
                    "khoa",
                    "bằng cử nhân",
                    "bằng thạc sĩ",
                    "công nghệ thông tin",
                    "kinh tế",
                    "luật",
                    "y khoa",
                    "kỹ thuật",
                    "quản trị kinh doanh",
                    "tài chính",
                    "marketing",
                    "du lịch",
                ],
                "patterns": [
                    r"ngành\s+\w+",
                    r"chuyên ngành\s+\w+",
                    r"khoa\s+\w+",
                    r"học\s+\w+\s+ở\s+đâu",
                ],
            },
            "admission_process": {
                "keywords": [
                    "xét tuyển",
                    "tuyển sinh",
                    "đăng ký",
                    "hồ sơ",
                    "thủ tục",
                    "điều kiện",
                    "yêu cầu",
                    "phương thức",
                    "kỳ thi",
                    "điểm chuẩn",
                    "thời gian",
                    "deadline",
                    "hạn chót",
                    "nộp hồ sơ",
                ],
                "patterns": [
                    r"làm\s+thế\s+nào\s+để",
                    r"cách\s+\w+",
                    r"quy\s+trình\s+\w+",
                    r"thủ\s+tục\s+\w+",
                ],
            },
            "fees_scholarships": {
                "keywords": [
                    "học phí",
                    "chi phí",
                    "tiền học",
                    "học bổng",
                    "miễn giảm",
                    "hỗ trợ tài chính",
                    "vay vốn",
                    "trả góp",
                    "giá cả",
                    "phí",
                ],
                "patterns": [
                    r"học\s+phí\s+\w+",
                    r"chi\s+phí\s+\w+",
                    r"bao\s+nhiêu\s+tiền",
                    r"giá\s+\w+",
                ],
            },
            "facilities_campus": {
                "keywords": [
                    "cơ sở vật chất",
                    "thư viện",
                    "phòng lab",
                    "ký túc xá",
                    "căng tin",
                    "sân chơi",
                    "wifi",
                    "máy tính",
                    "thiết bị",
                    "địa chỉ",
                    "vị trí",
                ],
                "patterns": [r"có\s+\w+\s+không", r"ở\s+đâu", r"địa\s+chỉ\s+\w+"],
            },
            "career_prospects": {
                "keywords": [
                    "việc làm",
                    "nghề nghiệp",
                    "cơ hội",
                    "tương lai",
                    "ra trường",
                    "mức lương",
                    "công ty",
                    "doanh nghiệp",
                    "thực tập",
                ],
                "patterns": [
                    r"ra\s+trường\s+làm\s+gì",
                    r"cơ\s+hội\s+việc\s+làm",
                    r"tương\s+lai\s+\w+",
                ],
            },
            "general_info": {
                "keywords": [
                    "trường",
                    "đại học",
                    "thông tin",
                    "giới thiệu",
                    "lịch sử",
                    "thành lập",
                    "danh tiếng",
                    "xếp hạng",
                    "chất lượng",
                ],
                "patterns": [
                    r"trường\s+\w+\s+như\s+thế\s+nào",
                    r"giới\s+thiệu\s+về\s+\w+",
                ],
            },
        }

        # Context keywords for follow-up questions
        self.context_keywords = {
            "follow_up": ["còn", "thêm", "nữa", "khác", "tiếp theo", "và"],
            "clarification": ["ý nghĩa", "có nghĩa", "hiểu", "rõ hơn", "chi tiết"],
            "comparison": ["so với", "khác", "giống", "tương tự", "hơn", "kém"],
        }

    async def analyze_query(
        self, query: str, context_messages: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze query to understand intent and context"""

        analysis = {
            "type": "general",
            "confidence": 0.0,
            "keywords": [],
            "intent": "information_seeking",
            "context_type": None,
            "requires_context": False,
            "complexity": "simple",
        }

        query_lower = query.lower()

        # Analyze query type
        max_confidence = 0
        best_type = "general"

        for query_type, patterns in self.query_patterns.items():
            confidence = self._calculate_type_confidence(query_lower, patterns)
            if confidence > max_confidence:
                max_confidence = confidence
                best_type = query_type

        analysis["type"] = best_type
        analysis["confidence"] = max_confidence

        # Extract keywords
        analysis["keywords"] = self._extract_keywords(query_lower)

        # Analyze intent
        analysis["intent"] = self._analyze_intent(query_lower, context_messages)

        # Check if context is needed
        analysis["requires_context"] = self._requires_context(
            query_lower, context_messages
        )
        analysis["context_type"] = self._get_context_type(query_lower)

        # Determine complexity
        analysis["complexity"] = self._determine_complexity(
            query_lower, context_messages
        )

        logger.debug(f"Query analysis: {analysis}")
        return analysis

    def _calculate_type_confidence(
        self, query: str, patterns: Dict[str, List[str]]
    ) -> float:
        """Calculate confidence score for a query type"""
        keyword_matches = 0
        pattern_matches = 0

        # Check keyword matches
        for keyword in patterns["keywords"]:
            if keyword in query:
                keyword_matches += 1

        # Check pattern matches
        for pattern in patterns["patterns"]:
            if re.search(pattern, query):
                pattern_matches += 1

        # Calculate confidence (weighted)
        keyword_score = keyword_matches / len(patterns["keywords"]) * 0.7
        pattern_score = pattern_matches / len(patterns["patterns"]) * 0.3

        return keyword_score + pattern_score

    def _extract_keywords(self, query: str) -> List[str]:
        """Extract important keywords from query"""
        keywords = []

        # Extract all keywords from all patterns
        for patterns in self.query_patterns.values():
            for keyword in patterns["keywords"]:
                if keyword in query:
                    keywords.append(keyword)

        return list(set(keywords))  # Remove duplicates

    def _analyze_intent(
        self, query: str, context_messages: List[Dict[str, Any]] = None
    ) -> str:
        """Analyze the intent behind the query"""

        # Question words indicate information seeking
        question_words = [
            "gì",
            "ai",
            "đâu",
            "khi nào",
            "như thế nào",
            "tại sao",
            "bao nhiêu",
        ]
        if any(word in query for word in question_words):
            return "information_seeking"

        # Action words indicate action intent
        action_words = ["đăng ký", "nộp", "làm", "thực hiện", "liên hệ"]
        if any(word in query for word in action_words):
            return "action_seeking"

        # Comparison words
        comparison_words = ["so với", "khác", "giống", "tương tự", "hơn"]
        if any(word in query for word in comparison_words):
            return "comparison"

        # Follow-up indicators
        if context_messages and any(
            word in query for word in self.context_keywords["follow_up"]
        ):
            return "follow_up"

        return "information_seeking"

    def _requires_context(
        self, query: str, context_messages: List[Dict[str, Any]] = None
    ) -> bool:
        """Determine if the query requires conversation context"""

        # Short queries often need context
        if len(query.split()) <= 3:
            return True

        # Pronouns indicate context dependency
        pronouns = ["nó", "đó", "này", "kia", "đấy", "ấy"]
        if any(pronoun in query for pronoun in pronouns):
            return True

        # Follow-up keywords
        if any(word in query for word in self.context_keywords["follow_up"]):
            return True

        # Clarification requests
        if any(word in query for word in self.context_keywords["clarification"]):
            return True

        return False

    def _get_context_type(self, query: str) -> Optional[str]:
        """Determine what type of context is needed"""

        if any(word in query for word in self.context_keywords["follow_up"]):
            return "follow_up"

        if any(word in query for word in self.context_keywords["clarification"]):
            return "clarification"

        if any(word in query for word in self.context_keywords["comparison"]):
            return "comparison"

        return None

    def _determine_complexity(
        self, query: str, context_messages: List[Dict[str, Any]] = None
    ) -> str:
        """Determine query complexity"""

        word_count = len(query.split())

        # Multiple questions or conditions
        if "và" in query or "hoặc" in query or "?" in query:
            return "complex"

        # Long queries
        if word_count > 15:
            return "complex"

        # Medium length with specific terms
        if word_count > 8 and len(self._extract_keywords(query)) > 2:
            return "medium"

        return "simple"
