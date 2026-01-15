# retail-banking-api

Retail Banking API (Node.js). Manages customer accounts and transactions.

## Run locally

```bash
npm install
npm run start
```

Service listens on `:8090` by default.

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/accounts`
  - Optional query param: `customerId`
- `GET /api/v1/accounts/{accountId}`
- `POST /api/v1/accounts`
- `GET /api/v1/transactions`
  - Optional query params: `accountId`, `customerId`
- `POST /api/v1/transactions`

## Example requests

List accounts for customer:

```bash
curl "http://localhost:8090/api/v1/accounts?customerId=CUST-001"
```

Create transaction:

```bash
curl -X POST http://localhost:8090/api/v1/transactions \
  -H 'content-type: application/json' \
  -d '{
    "accountId": "existing-account-id",
    "amount": 150.00,
    "type": "DEBIT",
    "description": "ATM withdrawal"
  }'
```

## Environment variables

- `PORT` (default `8090`)
- `ENVIRONMENT` (default `local`)
- `SERVICE_NAME` (default `retail-banking-api`)

## Notes

- Uses in-memory storage for demo purposes
- Automatically updates account balances on transactions
- Ready for containerization
