# corp-banking-api

Corporate Banking API (FastAPI). This service provides mock corporate banking endpoints that are intentionally demo-friendly for GitOps + pipeline workflows.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/accounts`
  - Optional filter header: `X-Corporate-Id`
- `GET /api/v1/accounts/{account_id}`
- `GET /api/v1/approvals/pending`
- `POST /api/v1/approvals/{approval_id}/approve`
- `POST /api/v1/approvals/{approval_id}/reject`
- `GET /api/v1/treasury/positions`

## Swagger UI

- `http://localhost:8080/docs`

## Example requests

List accounts:

```bash
curl http://localhost:8080/api/v1/accounts
```

List accounts for a specific corporate:

```bash
curl http://localhost:8080/api/v1/accounts \
  -H 'X-Corporate-Id: CORP-RETAILBANK-001'
```

Pending approvals:

```bash
curl http://localhost:8080/api/v1/approvals/pending
```

Approve an approval:

```bash
curl -X POST http://localhost:8080/api/v1/approvals/APR-90001/approve
```

## Environment variables

This service currently uses static in-memory data and doesn’t require env vars, but these are commonly used when containerizing:

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)
