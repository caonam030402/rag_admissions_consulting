# Data Pipeline - RAG Admissions Consulting

Folder này chứa toàn bộ pipeline xử lý dữ liệu từ crawling đến processing cho hệ thống RAG.

## 📁 Cấu trúc

```
data_pipeline/
├── crawlers/           # Web crawlers
│   ├── scraper.py     # Main scraper
│   └── scrape_example.py  # Example crawler
├── processors/         # Data processors
│   └── data_processing.py  # Main data processor
├── raw_data/          # Dữ liệu thô từ crawling
│   ├── donga_admissions.csv
│   ├── donga_admissions.json
│   └── donga_json_to_csv.py
└── processed_data/    # Dữ liệu đã xử lý
```

## 🔄 Data Flow

```
Website → Crawlers → Raw Data → Processors → Processed Data → Vector Store
```

## 🕷️ Crawlers

### `scraper.py`
- Main scraper cho website Đại học Đông Á
- Crawl thông tin tuyển sinh, ngành học, học phí

### `scrape_example.py`
- Example crawler để tham khảo
- Template cho việc tạo crawler mới

## ⚙️ Processors

### `data_processing.py`
- Xử lý và làm sạch dữ liệu thô
- Chuẩn hóa format
- Tạo embeddings
- Lưu vào vector store

## 📊 Data Storage

### Raw Data (`raw_data/`)
- **CSV files**: Dữ liệu dạng bảng
- **JSON files**: Dữ liệu có cấu trúc phức tạp
- **Text files**: Nội dung văn bản thô

### Processed Data (`processed_data/`)
- **Cleaned data**: Dữ liệu đã làm sạch
- **Embeddings**: Vector representations
- **Metadata**: Thông tin bổ sung

## 🚀 Usage

### 1. Crawling Data
```bash
# Chạy main scraper
python data_pipeline/crawlers/scraper.py

# Chạy example scraper
python data_pipeline/crawlers/scrape_example.py
```

### 2. Processing Data
```bash
# Xử lý dữ liệu thô
python data_pipeline/processors/data_processing.py
```

### 3. Pipeline hoàn chỉnh
```bash
# Chạy toàn bộ pipeline
python run_data_pipeline.py
```

## 🔧 Configuration

Cấu hình crawling và processing trong `config/settings.py`:

```python
# Crawler settings
CRAWLER_DELAY = 1  # Delay giữa các request (seconds)
MAX_PAGES = 100    # Số trang tối đa để crawl
USER_AGENT = "RAG-Bot/1.0"

# Processor settings
CHUNK_SIZE = 1000  # Kích thước chunk cho text splitting
OVERLAP = 200      # Overlap giữa các chunk
```

## 📝 Data Sources

### Đại học Đông Á Website
- **Tuyển sinh**: https://donga.edu.vn/tuyen-sinh
- **Ngành học**: https://donga.edu.vn/nganh-hoc
- **Học phí**: https://donga.edu.vn/hoc-phi
- **Tin tức**: https://donga.edu.vn/tin-tuc

## 🛡️ Best Practices

### Crawling Ethics
- Respect robots.txt
- Implement delays between requests
- Don't overload the server
- Cache responses when possible

### Data Quality
- Validate data after crawling
- Remove duplicates
- Handle encoding issues
- Clean HTML tags and special characters

### Error Handling
- Retry failed requests
- Log errors for debugging
- Graceful degradation
- Resume interrupted crawls

## 📈 Monitoring

### Crawling Metrics
- Pages crawled per hour
- Success/failure rates
- Response times
- Data quality scores

### Processing Metrics
- Processing time per document
- Memory usage
- Vector store update status
- Error rates

## 🔄 Automation

### Scheduled Crawling
```bash
# Crontab example - crawl daily at 2 AM
0 2 * * * /path/to/python data_pipeline/crawlers/scraper.py
```

### CI/CD Integration
- Automated testing of crawlers
- Data validation pipelines
- Deployment to production
- Monitoring and alerting 