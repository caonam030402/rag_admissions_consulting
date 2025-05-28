# Data Sources API Examples

## Universal Upload Endpoint

### POST `/api/v1/data-sources/upload`

Endpoint thống nhất để upload tất cả loại data sources.

## 1. Website Crawl

```bash
curl -X POST "http://localhost:3000/api/v1/data-sources/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "type=website" \
  -F "name=VNU University Website" \
  -F "description=Crawl admissions information from VNU" \
  -F "url=https://vnu.edu.vn/admissions" \
  -F "uploaderEmail=admin@vnu.edu.vn" \
  -F "uploadedBy=admin123" \
  -F "metadata={\"crawlDepth\": 3, \"maxPages\": 100}"
```

## 2. PDF File Upload

```bash
curl -X POST "http://localhost:3000/api/v1/data-sources/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "type=pdf" \
  -F "name=University Handbook 2024" \
  -F "description=Student handbook with admission requirements" \
  -F "file=@/path/to/handbook.pdf" \
  -F "uploaderEmail=admin@vnu.edu.vn" \
  -F "uploadedBy=admin123"
```

## 3. CSV Data Upload

```bash
curl -X POST "http://localhost:3000/api/v1/data-sources/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "type=csv" \
  -F "name=Student FAQ Data" \
  -F "description=Common questions and answers about admissions" \
  -F "file=@/path/to/faq.csv" \
  -F "uploaderEmail=admin@vnu.edu.vn" \
  -F "uploadedBy=admin123"
```

## 4. Manual Q&A Input

```bash
curl -X POST "http://localhost:3000/api/v1/data-sources/upload" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: multipart/form-data" \
  -F "type=manual" \
  -F "name=Tuition Fee Information" \
  -F "description=Manual entry about tuition fees" \
  -F "title=What are the tuition fees for 2024?" \
  -F "content=The tuition fees for undergraduate programs in 2024 are 2.5 million VND per semester for Vietnamese students and $2000 per semester for international students." \
  -F "uploaderEmail=admin@vnu.edu.vn" \
  -F "uploadedBy=admin123"
```

## Frontend JavaScript Examples

### 1. Website Crawl

```javascript
const formData = new FormData();
formData.append('type', 'website');
formData.append('name', 'VNU University Website');
formData.append('description', 'Crawl admissions information');
formData.append('url', 'https://vnu.edu.vn/admissions');
formData.append('uploaderEmail', 'admin@vnu.edu.vn');
formData.append('uploadedBy', 'admin123');

const response = await fetch('/api/v1/data-sources/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 2. File Upload

```javascript
const formData = new FormData();
formData.append('type', file.type === 'application/pdf' ? 'pdf' : 'csv');
formData.append('name', document.getElementById('name').value);
formData.append('description', document.getElementById('description').value);
formData.append('file', file);
formData.append('uploaderEmail', user.email);
formData.append('uploadedBy', user.id);

const response = await fetch('/api/v1/data-sources/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 3. Manual Input

```javascript
const formData = new FormData();
formData.append('type', 'manual');
formData.append('name', 'Custom Q&A');
formData.append('description', 'Manual knowledge entry');
formData.append('title', question);
formData.append('content', answer);
formData.append('uploaderEmail', user.email);
formData.append('uploadedBy', user.id);

const response = await fetch('/api/v1/data-sources/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Response Format

```json
{
  "id": "uuid-here",
  "name": "Data Source Name",
  "description": "Description",
  "type": "web_crawl|file_upload|manual_input",
  "status": "pending|processing|completed|failed",
  "sourceUrl": "https://example.com", // for web crawl
  "filePath": "filename.pdf", // for file upload
  "documentsCount": 0,
  "vectorsCount": 0,
  "uploadedBy": "user-id",
  "uploaderEmail": "user@example.com",
  "processingStartedAt": null,
  "processingCompletedAt": null,
  "errorMessage": null,
  "metadata": {
    "sourceType": "website|pdf|csv|manual",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    // additional metadata based on type
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

### Missing Required Fields
```json
{
  "statusCode": 400,
  "message": "Type and name are required",
  "error": "Bad Request"
}
```

### Invalid File Type
```json
{
  "statusCode": 400,
  "message": "Unsupported file type. Only PDF and CSV files are allowed.",
  "error": "Bad Request"
}
```

### Missing URL for Website Crawl
```json
{
  "statusCode": 400,
  "message": "URL is required for website crawl",
  "error": "Bad Request"
}
``` 