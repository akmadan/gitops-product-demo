# loans-api

Loans API (FastAPI). Manages loan applications and integrates with credit scoring and document processing services.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8083
```

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/applications`
  - Optional filter header: `X-Applicant-Id`
- `GET /api/v1/applications/{application_id}`
- `POST /api/v1/applications`
- `POST /api/v1/applications/{application_id}/approve`
- `POST /api/v1/applications/{application_id}/reject`

## Swagger UI

- `http://localhost:8083/docs`

## Example requests

Create application:

```bash
curl -X POST http://localhost:8083/api/v1/applications \
  -H 'content-type: application/json' \
  -d '{
    "applicant_id": "CUST-001",
    "loan_amount": 25000,
    "loan_purpose": "PERSONAL",
    "term_months": 36,
    "income_annual": 75000,
    "debt_existing": 15000,
    "employment_type": "FULL_TIME",
    "credit_history_length_years": 8,
    "num_credit_lines": 5,
    "recent_delinquencies": 0
  }'
```

List applications for applicant:

```bash
curl http://localhost:8083/api/v1/applications \
  -H 'X-Applicant-Id: CUST-001'
```

## Environment variables

- `ENVIRONMENT` (not required; informational)
- `PORT` (set via `uvicorn --port`)
- `CREDIT_SCORING_URL` (default: `http://credit-scoring:8085`)
- `DOCUMENT_PROCESSING_URL` (default: `http://document-processing:8084`)

## Notes

- Uses in-memory storage for demo purposes
- Integrates with credit-scoring service (with fallback mock score)
- Ready for containerization and service discovery
