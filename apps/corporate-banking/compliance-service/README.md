# compliance-service

## Run locally

```bash
npm install
npm run start
```

Service listens on `:8082` by default.

## Endpoints

- `GET /health`
- `GET /ready`
- `GET /api/v1/policies`
- `POST /api/v1/check`

### Example: compliance check

```bash
curl -X POST http://localhost:8082/api/v1/check \
  -H 'content-type: application/json' \
  -d '{"environmentType":"prod-na","requestedAt":"2026-01-14T18:00:00Z","changeType":"K8S_MANIFEST"}'
```

## Environment variables

- `PORT` (default `8082`)
- `ENVIRONMENT` (default `local`)
- `SERVICE_NAME` (default `compliance-service`)
