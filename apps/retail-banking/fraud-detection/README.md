# fraud-detection

Fraud Detection Service (Python FastAPI). ML-based fraud detection with hardcoded logic for demo purposes.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8093
```

## Endpoints

- `GET /health`
- `GET /ready`
- `POST /api/v1/check`
- `GET /api/v1/model/info`

## Swagger UI

- `http://localhost:8093/docs`

## Example requests

Check transaction for fraud:

```bash
curl -X POST http://localhost:8093/api/v1/check \
  -H 'content-type: application/json' \
  -d '{
    "transaction_id": "TXN-000001",
    "account_id": "ACC-001",
    "amount": 15000.00,
    "transaction_type": "DEBIT",
    "description": "Large transfer"
  }'
```

Get model info:

```bash
curl http://localhost:8093/api/v1/model/info
```

## Environment variables

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)

## Notes

- Uses hardcoded ML logic for demo purposes (real implementation would use trained models)
- Considers transaction amount, time, type, and account patterns
- Returns fraud probability, risk level, and explanatory reasons
- Threshold for fraud detection: 0.7 (70% probability)
