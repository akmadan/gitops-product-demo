# loans-ui

Loans Portal React UI to test Loans APIs (applications, credit scoring, document processing).

## Run locally

1) Start backend services:

- `loans-api` (FastAPI): `localhost:8083`
- `credit-scoring` (FastAPI): `localhost:8085`
- `document-processing` (Node): `localhost:8084`

2) Start UI:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:5174`

## Local proxy setup

The UI calls these paths (so no CORS issues in dev):

- `/api/loans/*` → `http://localhost:8083/*`
- `/api/scoring/*` → `http://localhost:8085/*`
- `/api/docs/*` → `http://localhost:8084/*`

## Features

- Create/list/approve/reject loan applications
- Run credit scoring with mock ML logic
- View document processing status
- JSON response viewer for each API call

## Environment variables

- `PORT` (default `5174`)
