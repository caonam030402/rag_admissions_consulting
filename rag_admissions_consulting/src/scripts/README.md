# Utility Scripts

Folder này chứa các utility scripts để quản lý và vận hành hệ thống.

## 📁 Scripts

### `seed.py`
- **Mục đích**: Seed dữ liệu vào vector store
- **Chức năng**: Load data từ CSV/JSON/PDF và upload lên Pinecone
- **Usage**: `python scripts/seed.py`

### `run_data_pipeline.py`
- **Mục đích**: Chạy toàn bộ data pipeline
- **Chức năng**: Crawling → Processing → Seeding
- **Usage**: `python scripts/run_data_pipeline.py`

## 🚀 Usage

### Seeding Data
```bash
# Seed từ CSV files
python scripts/seed.py

# Hoặc chỉnh sửa trong code để seed từ PDF/JSON
# seed_data(FileDataType.PDF)
# seed_data(FileDataType.JSON)
```

### Running Data Pipeline
```bash
# Chạy toàn bộ pipeline
python scripts/run_data_pipeline.py

# Logs sẽ được lưu trong logs/data_pipeline_YYYY-MM-DD.log
```

## 📊 Data Flow

```
Raw Data → Text Splitting → Embeddings → Vector Store
```

### Supported Data Types
- **CSV**: Structured data from crawling
- **JSON**: Semi-structured data
- **PDF**: Document files

## 🔧 Configuration

Scripts sử dụng cấu hình từ `config/settings.py` và environment variables:

```bash
# Required environment variables
PINECONE_API_KEY=your_pinecone_key
GEMINI_API_KEY=your_gemini_key
```

## 📝 Logging

Tất cả scripts có logging chi tiết:
- **Console output**: INFO level
- **File logs**: DEBUG level trong `logs/` folder
- **Rotation**: Daily rotation cho log files

## ⚠️ Notes

- Chạy scripts từ root directory (`src/`)
- Đảm bảo có file `.env` với API keys
- Kiểm tra logs nếu có lỗi
- Scripts có thể chạy độc lập hoặc qua pipeline 