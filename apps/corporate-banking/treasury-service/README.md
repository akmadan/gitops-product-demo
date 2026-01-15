# treasury-service

## Run locally

```bash
go run .
```

Service listens on `:8081` by default.

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/treasury/positions`
- `GET /api/v1/treasury/rates`
- `GET /api/v1/treasury/hedge/recommendations`

## Environment variables

- `LISTEN_ADDR` (default `:8081`)
- `ENVIRONMENT` (default `local`)
- `SERVICE_NAME` (default `treasury-service`)
