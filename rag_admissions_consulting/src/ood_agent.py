from loguru import logger
from typing import List, Tuple, Dict, Any, Optional
from langchain_core.documents import Document
from ood_config import (
    OOD_SIMILARITY_THRESHOLD,
    OOD_DEFAULT_RESPONSE,
    ENABLE_OOD_DETECTION,
)


class OODAgent:
    """
    Out-of-Domain (OOD) detection agent.
    Responsible for determining if a question falls outside the scope of our trained/stored data.
    """

    def __init__(
        self,
        similarity_threshold: float = OOD_SIMILARITY_THRESHOLD,
        enabled: bool = ENABLE_OOD_DETECTION,
    ):
        """
        Initialize the OOD detection agent.

        Args:
            similarity_threshold: Minimum similarity score required to consider a question in-domain.
            enabled: Whether OOD detection is enabled
        """
        self.similarity_threshold = similarity_threshold
        self.enabled = enabled
        logger.info(
            f"OOD Agent initialized with similarity threshold: {similarity_threshold}, enabled: {enabled}"
        )

    def _is_education_related(self, question: str) -> bool:
        """
        Simple heuristic to check if a question is education or admission related

        Args:
            question: The user's question

        Returns:
            Boolean indicating if the question appears to be education/admission related
        """
        education_keywords = [
            "học",
            "ngành",
            "khoa",
            "đại học",
            "cao đẳng",
            "tuyển sinh",
            "điểm",
            "chuyên ngành",
            "học phí",
            "đào tạo",
            "trường",
            "lớp",
            "giảng viên",
            "sinh viên",
            "học bổng",
            "ký túc xá",
            "chứng chỉ",
            "tốt nghiệp",
            "tín chỉ",
            "môn học",
            "điều dưỡng",
            "công nghệ",
            "kinh tế",
            "quản trị",
            "luật",
            "kỹ sư",
        ]

        question_lower = question.lower()
        for keyword in education_keywords:
            if keyword in question_lower:
                logger.info(f"Question contains education keyword '{keyword}'")
                return True

        return False

    def is_out_of_domain(
        self, question: str, retrieved_docs: List[Document]
    ) -> Tuple[bool, str]:
        """
        Determine if a question is out-of-domain based on retrieved documents.

        Args:
            question: The user's question
            retrieved_docs: List of documents retrieved from the vector store

        Returns:
            Tuple of (is_ood, explanation)
            - is_ood: Boolean indicating if the question is out-of-domain
            - explanation: Explanation of why it was classified as OOD (if applicable)
        """
        if not self.enabled:
            return False, ""

        logger.info(f"Checking if question is OOD: '{question}'")

        # First check if the question appears education/admission related by keywords
        if self._is_education_related(question):
            logger.info(
                "Question appears to be education/admission related by keywords, not marking as OOD"
            )
            return False, ""

        # If no documents were retrieved, it's likely OOD
        if not retrieved_docs:
            logger.info("No documents retrieved, marking as OOD")
            return True, "Không tìm thấy tài liệu liên quan"

        # Check if the top document's score is below our threshold
        # Note: This assumes the documents have a metadata field with score
        try:
            # Sort documents by score if available
            docs_with_scores = []
            for doc in retrieved_docs:
                score = doc.metadata.get("score", 0)
                docs_with_scores.append((doc, score))

            # Sort by score in descending order
            docs_with_scores.sort(key=lambda x: x[1], reverse=True)

            # Log scores for debugging
            if docs_with_scores:
                logger.info(
                    f"Top document score: {docs_with_scores[0][1]}, threshold: {self.similarity_threshold}"
                )
                for i, (doc, score) in enumerate(
                    docs_with_scores[:3]
                ):  # Log top 3 docs only
                    logger.info(
                        f"Document {i+1} score: {score}, content: {doc.page_content[:100]}..."
                    )

            # Check top document score
            if docs_with_scores and docs_with_scores[0][1] < self.similarity_threshold:
                # But if the question is clearly education related, use a lower threshold
                if self._is_education_related(question):
                    logger.info(
                        f"Education-related question with low score, but still allowing"
                    )
                    return False, ""

                logger.info(
                    f"Top document score {docs_with_scores[0][1]} below threshold {self.similarity_threshold}"
                )
                return True, f"Độ tương đồng thấp (score: {docs_with_scores[0][1]:.2f})"
        except Exception as e:
            logger.error(f"Error checking scores: {e}")
            # If there's an error, don't mark as OOD
            return False, ""

        logger.info("Question appears to be in-domain")
        return False, ""

    def get_ood_response(self, question: str) -> str:
        """
        Generate a polite response for out-of-domain questions.

        Args:
            question: The user's question

        Returns:
            A polite response indicating the question is outside our domain
        """
        return OOD_DEFAULT_RESPONSE
