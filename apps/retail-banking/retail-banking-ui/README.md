# retail-banking-ui

Retail Banking Portal React UI to test Retail Banking APIs (accounts, transactions, fraud detection, logging).

## Run locally

1) Start backend services:

- `account-service` (FastAPI): `localhost:8091`
- `transaction-service` (FastAPI): `localhost:8092`
- `fraud-detection` (FastAPI): `localhost:8093`
- `logging-service` (Node): `localhost:8094`

2) Start UI:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:5175`

## Local proxy setup

The UI calls these paths (so no CORS issues in dev):

- `/api/accounts/*` → `http://localhost:8091/*`
- `/api/transactions/*` → `http://localhost:8092/*`
- `/api/fraud/*` → `http://localhost:8093/*`
- `/api/logs/*` → `http://localhost:8094/*`

## Features

- Create/list/suspend/activate accounts
- Create/list transactions with automatic fraud detection
- Test fraud detection with various scenarios
- Ingest and query logs
- JSON response viewer for each API call

## Environment variables

- `PORT` (default `5175`)
