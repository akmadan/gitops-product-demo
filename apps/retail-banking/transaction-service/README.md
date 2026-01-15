# transaction-service

Transaction Processing Service (Python FastAPI). Handles financial transactions with fraud detection integration.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8092
```

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/transactions`
  - Optional filter header: `X-Account-Id`
- `GET /api/v1/transactions/{transaction_id}`
- `POST /api/v1/transactions`

## Swagger UI

- `http://localhost:8092/docs`

## Example requests

Create transaction:

```bash
curl -X POST http://localhost:8092/api/v1/transactions \
  -H 'content-type: application/json' \
  -d '{
    "account_id": "ACC-001",
    "amount": 150.00,
    "transaction_type": "DEBIT",
    "description": "ATM withdrawal"
  }'
```

## Environment variables

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)
- `ACCOUNT_SERVICE_URL` (default: `http://account-service:8091`)
- `FRAUD_DETECTION_URL` (default: `http://fraud-detection:8093`)

## Notes

- Integrates with account-service for validation
- Integrates with fraud-detection service for security checks
- Uses in-memory storage for demo purposes
