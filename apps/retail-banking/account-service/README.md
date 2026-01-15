# account-service

Account Management Service (Python FastAPI). Handles customer account operations.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8091
```

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/accounts`
  - Optional filter header: `X-Customer-Id`
- `GET /api/v1/accounts/{account_id}`
- `POST /api/v1/accounts`
- `PUT /api/v1/accounts/{account_id}/suspend`
- `PUT /api/v1/accounts/{account_id}/activate`

## Swagger UI

- `http://localhost:8091/docs`

## Example requests

Create account:

```bash
curl -X POST http://localhost:8091/api/v1/accounts \
  -H 'content-type: application/json' \
  -d '{
    "customer_id": "CUST-003",
    "account_number": "1003",
    "initial_balance": 1000.00,
    "currency": "USD"
  }'
```

Suspend account:

```bash
curl -X PUT http://localhost:8091/api/v1/accounts/ACC-001/suspend
```

## Environment variables

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)
