# corp-banking-ui

Minimal React UI to test Corporate Banking APIs.

## Run locally

1) Start the backend services:

- `corp-banking-api` (FastAPI): `localhost:8080`
- `treasury-service` (Go): `localhost:8081`
- `compliance-service` (Node): `localhost:8082`

2) Start the UI:

```bash
npm install
npm run dev
```

Open:
- `http://localhost:5173`

## Local proxy setup

The UI calls these paths (so no CORS issues in dev):

- `/api/corp/*` → `http://localhost:8080/*`
- `/api/treasury/*` → `http://localhost:8081/*`
- `/api/compliance/*` → `http://localhost:8082/*`
