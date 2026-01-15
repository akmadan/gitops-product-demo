const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const serviceName = process.env.SERVICE_NAME || 'document-processing';
const environment = process.env.ENVIRONMENT || 'local';
const port = Number(process.env.PORT || 8084);

function utcNowISO() {
  return new Date().toISOString();
}

// In-memory store for demo purposes
const documents = new Map();

// Mock metadata extraction
function extractMetadata(filename, mimetype) {
  return {
    type: mimetype.startsWith('image/') ? 'IDENTITY_DOCUMENT' : 'FINANCIAL_STATEMENT',
    pages: mimetype.startsWith('image/') ? 1 : Math.floor(Math.random() * 10) + 1,
    extractedFields: {
      documentNumber: `DOC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  };
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

// Get all documents
app.get('/api/v1/documents', (req, res) => {
  const docs = Array.from(documents.values());
  res.json({ documents: docs, count: docs.length, as_of: utcNowISO() });
});

// Get document by ID
app.get('/api/v1/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const doc = documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

// Upload document
app.post('/api/v1/documents/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const documentId = uuidv4();
  const metadata = extractMetadata(req.file.originalname, req.file.mimetype);
  
  const document = {
    documentId,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: utcNowISO(),
    status: 'PROCESSED',
    metadata,
    processingSteps: [
      { step: 'UPLOAD', status: 'COMPLETED', timestamp: utcNowISO() },
      { step: 'EXTRACTION', status: 'COMPLETED', timestamp: utcNowISO() },
      { step: 'VALIDATION', status: 'COMPLETED', timestamp: utcNowISO() }
    ]
  };

  documents.set(documentId, document);

  res.status(201).json(document);
});

// Re-process document
app.post('/api/v1/documents/:documentId/reprocess', (req, res) => {
  const { documentId } = req.params;
  const doc = documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  doc.status = 'PROCESSING';
  doc.processingSteps.push({ step: 'REPROCESS', status: 'IN_PROGRESS', timestamp: utcNowISO() });

  // Simulate async processing
  setTimeout(() => {
    doc.status = 'PROCESSED';
    const lastStep = doc.processingSteps.find(s => s.step === 'REPROCESS');
    if (lastStep) lastStep.status = 'COMPLETED';
  }, 2000);

  res.json({ message: 'Reprocessing started', documentId });
});

// Delete document
app.delete('/api/v1/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const deleted = documents.delete(documentId);
  if (!deleted) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ message: 'Document deleted', documentId });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${serviceName} listening on :${port} (env=${environment})`);
});
