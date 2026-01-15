# credit-scoring

Credit Scoring Service (Python FastAPI). Provides hardcoded ML-style credit scoring for loan applications.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8085
```

## Endpoints

- `GET /health`
- `GET /ready`
- `POST /api/v1/score`
- `GET /api/v1/score/{applicant_id}` (mock score)

## Swagger UI

- `http://localhost:8085/docs`

## Example requests

Score an application:

```bash
curl -X POST http://localhost:8085/api/v1/score \
  -H 'content-type: application/json' \
  -d '{
    "applicant_id": "APP-001",
    "income_annual": 75000,
    "debt_existing": 15000,
    "credit_history_length_years": 8,
    "num_credit_lines": 5,
    "recent_delinquencies": 0,
    "employment_type": "FULL_TIME",
    "loan_amount": 25000,
    "loan_purpose": "PERSONAL"
  }'
```

Get mock score by applicant ID:

```bash
curl http://localhost:8085/api/v1/score/APP-001
```

## Environment variables

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)
