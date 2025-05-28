# RAG Admissions Consulting - Data Pipeline Flow

## 🔄 Complete Data Flow Architecture

### 1. Frontend → Backend → Python → Pinecone

```
Frontend Upload → Backend API → Python Scripts → Vector Store
      ↓              ↓              ↓              ↓
   User Action   Process Data   AI Pipeline   Knowledge Base
```

## 📊 Data Source Types & Processing Flow

### 🌐 Website Crawling
```
Frontend: type="website", url="https://example.com"
   ↓
Backend: /api/v1/data-sources/upload
   ↓
Python: scraper.py → JSON → CSV → seed.py → Pinecone
   ↓
Result: Website content vectorized and searchable
```

### 📄 PDF File Upload
```
Frontend: type="pdf", file=document.pdf
   ↓
Backend: Save file → /uploads/timestamp-document.pdf
   ↓
Python: data_processing.py → Extract text → CSV → seed.py → Pinecone
   ↓
Result: PDF content vectorized and searchable
```

### 📊 CSV File Upload
```
Frontend: type="csv", file=data.csv
   ↓
Backend: Save file → /uploads/timestamp-data.csv
   ↓
Python: data_processing.py → Clean format → CSV → seed.py → Pinecone
   ↓
Result: CSV content vectorized and searchable
```

### ✍️ Manual Q&A Input
```
Frontend: type="manual", title="Question", content="Answer"
   ↓
Backend: Store in database
   ↓
Python: manual_processor.py → Format → CSV → seed.py → Pinecone
   ↓
Result: Manual content vectorized and searchable
```

## 🔧 Technical Implementation

### Backend API Endpoint
```typescript
POST /api/v1/data-sources/upload
Content-Type: multipart/form-data

Body:
- type: "website" | "pdf" | "csv" | "manual"
- name: string
- description?: string
- file?: File (for pdf/csv)
- url?: string (for website)
- title?: string (for manual)
- content?: string (for manual)
```

### Python Scripts Called

#### 1. Unified Pipeline Runner
```bash
python scripts/run_data_pipeline.py <data_source_id> <type> <input>
```

#### 2. Individual Scripts (called by pipeline)
```bash
# Website crawling
python data_pipeline/crawlers/scraper.py "url" "data_source_id"

# File processing  
python data_pipeline/processors/data_processing.py "file_path" "data_source_id"

# Manual input
python data_pipeline/processors/manual_processor.py '{"title":"Q","content":"A"}' "data_source_id"

# Vector store upload
python scripts/seed.py "csv_file_path" "data_source_id"
```

## 📁 File Structure & Outputs

### Generated Files
```
data_pipeline/
├── raw_data/
│   └── scraped_{data_source_id}.json     # Raw scraped data
├── processed_data/
│   ├── scraped_{data_source_id}.csv      # Website → CSV
│   ├── pdf_{data_source_id}.csv          # PDF → CSV
│   ├── csv_{data_source_id}.csv          # CSV → Standardized CSV
│   └── manual_{data_source_id}.csv       # Manual → CSV
└── logs/
    └── data_pipeline_YYYY-MM-DD.log     # Processing logs
```

### CSV Format (Standard Output)
```csv
Text
"University admission requirements include..."
"Tuition fees for 2024 academic year..."
"Application deadline is March 15th..."
```

## 🗄️ Database Schema

### DataSource Table
```sql
CREATE TABLE data_source (
    id UUID PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    type ENUM('web_crawl', 'file_upload', 'manual_input') NOT NULL,
    source_url VARCHAR(2000),
    file_path VARCHAR(1000),
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    documents_count INTEGER DEFAULT 0,
    vectors_count INTEGER DEFAULT 0,
    uploaded_by VARCHAR(100) NOT NULL,
    uploader_email VARCHAR(255) NOT NULL,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Processing Status Flow

### Status Transitions
```
pending → processing → completed ✅
        ↘            ↘ failed ❌
```

### Status Updates
1. **pending**: Data source created, waiting for processing
2. **processing**: Python scripts are running
3. **completed**: Successfully processed and uploaded to Pinecone
4. **failed**: Error occurred during processing

## 📈 Metrics Tracking

### What Gets Counted
- **documents_count**: Number of text chunks processed
- **vectors_count**: Number of embeddings created in Pinecone
- **processing_time**: Duration from start to completion
- **file_size**: Original file size (for uploads)

### Example Metrics
```json
{
  "documents_count": 45,
  "vectors_count": 180,
  "processing_time": "00:02:30",
  "metadata": {
    "originalName": "handbook.pdf",
    "fileSize": 2048576,
    "pages_processed": 15
  }
}
```

## 🔍 Error Handling

### Common Error Scenarios
1. **Invalid file format**: Only PDF/CSV allowed
2. **Empty content**: No extractable text found
3. **Network timeout**: Website unreachable
4. **Pinecone quota**: Vector store limits exceeded
5. **Processing timeout**: Script takes too long

### Error Response Format
```json
{
  "status": "failed",
  "error_message": "No text extracted from PDF file",
  "processing_completed_at": "2024-01-01T12:00:00Z"
}
```

## 🎯 Frontend Integration Examples

### JavaScript Upload Functions
```javascript
// Universal upload function
async function uploadDataSource(type, formData) {
  const response = await fetch('/api/v1/data-sources/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
}

// Website crawling
const websiteData = new FormData();
websiteData.append('type', 'website');
websiteData.append('name', 'University Website');
websiteData.append('url', 'https://university.edu');

// File upload
const fileData = new FormData();
fileData.append('type', 'pdf');
fileData.append('name', 'Admission Guide');
fileData.append('file', fileInput.files[0]);

// Manual input
const manualData = new FormData();
manualData.append('type', 'manual');
manualData.append('name', 'FAQ Entry');
manualData.append('title', 'What are the admission requirements?');
manualData.append('content', 'Students need minimum GPA 3.0...');
```

## ⚡ Performance Considerations

### Processing Times (Estimated)
- **Manual input**: ~5 seconds
- **Small CSV (< 100 rows)**: ~30 seconds  
- **PDF (< 50 pages)**: ~1-2 minutes
- **Website crawl (< 100 pages)**: ~3-5 minutes

### Optimization Tips
1. **Async processing**: Don't block frontend
2. **Progress tracking**: Show real-time status
3. **Batch uploads**: Group similar content
4. **Cache results**: Avoid reprocessing same content
5. **Error recovery**: Retry failed uploads

## 🔒 Security & Validation

### Input Validation
- File size limits (< 50MB)
- File type restrictions (.pdf, .csv only)
- URL validation (https only)
- Content length limits
- XSS protection for manual input

### Access Control
- JWT authentication required
- User-specific data sources
- Admin-only bulk operations
- Rate limiting on uploads

This complete flow ensures reliable, scalable, and user-friendly data ingestion for the RAG system! 🚀 