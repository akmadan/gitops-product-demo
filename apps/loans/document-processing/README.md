# document-processing

Loans Document Processing Service (Node.js). Handles document uploads, metadata extraction, and processing status tracking.

## Run locally

```bash
npm install
npm run start
```

Service listens on `:8084` by default.

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/documents`
- `GET /api/v1/documents/{documentId}`
- `POST /api/v1/documents/upload` (multipart/form-data with `file` field)
- `POST /api/v1/documents/{documentId}/reprocess`
- `DELETE /api/v1/documents/{documentId}`

## Example requests

List all documents:

```bash
curl http://localhost:8084/api/v1/documents
```

Upload a document:

```bash
curl -X POST http://localhost:8084/api/v1/documents/upload \
  -F "file=@/path/to/document.pdf"
```

Re-process a document:

```bash
curl -X POST http://localhost:8084/api/v1/documents/{documentId}/reprocess
```

## Environment variables

- `PORT` (default `8084`)
- `ENVIRONMENT` (default `local`)
- `SERVICE_NAME` (default `document-processing`)

## Notes

- Uses in-memory storage for demo purposes
- Mock metadata extraction for identity documents and financial statements
- File size limit: 10MB
