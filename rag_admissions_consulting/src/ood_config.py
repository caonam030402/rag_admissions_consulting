# Configuration settings for Out-of-Domain (OOD) detection

# Similarity threshold for OOD detection
# Documents with similarity scores below this value will be considered out-of-domain
OOD_SIMILARITY_THRESHOLD = 0.10

# Whether to use OOD detection for all queries
ENABLE_OOD_DETECTION = True

# Whether to use a general-purpose LLM for OOD questions
# If True, OOD questions will be handled by a more general LLM
# If False, a standard message will be returned for OOD questions
USE_GENERAL_LLM_FOR_OOD = False

# Generic response for OOD questions when not routing to general LLM
OOD_DEFAULT_RESPONSE = (
    "Xin lỗi, hiện tại tôi chỉ có thể trả lời các câu hỏi liên quan đến quy trình "
    "tuyển sinh và thông tin của trường. "
    "Vui lòng hỏi tôi về thông tin tuyển sinh, chương trình học, "
    "hoặc các quy trình nhập học."
)
