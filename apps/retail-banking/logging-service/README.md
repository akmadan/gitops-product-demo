# retail-logging-service

Retail Banking Logging Service (Node.js). Centralized logging with Winston for retail banking services.

## Run locally

```bash
npm install
npm run start
```

Service listens on `:8094` by default.

## Endpoints

- `GET /health`
- `GET /ready`
- `POST /api/v1/logs`
- `GET /api/v1/logs`
  - Optional query params: `service`, `level`, `limit`
- `GET /api/v1/logs/{logId}`

## Example requests

Ingest log:

```bash
curl -X POST http://localhost:8094/api/v1/logs \
  -H 'content-type: application/json' \
  -d '{
    "level": "info",
    "message": "Transaction processed successfully",
    "service": "transaction-service",
    "metadata": {
      "transaction_id": "TXN-001",
      "amount": 150.00
    }
  }'
```

Query logs:

```bash
curl "http://localhost:8094/api/v1/logs?service=transaction-service&level=info&limit=50"
```

## Environment variables

- `PORT` (default `8094`)
- `ENVIRONMENT` (default `local`)
- `SERVICE_NAME` (default `retail-logging-service`)

## Notes

- Uses Winston for structured logging
- In-memory storage for demo purposes (in production would use persistent storage)
- Provides log aggregation and querying capabilities
- Ready for containerization
