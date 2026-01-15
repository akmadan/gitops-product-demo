# Kubernetes Cluster Configurations

This directory contains Kubernetes manifests for all environments in the Harness GitOps banking demo.

## Environment Structure

```
clusters/
├── dev/           # Development (1 replica, basic config)
├── qa/            # Testing (2 replicas, integration testing)
├── preprod/       # Staging (3 replicas, production-like)
├── prod-na/       # Production North America (5 replicas, HA)
├── prod-eu/       # Production Europe (5 replicas, HA, GDPR)
└── prod-apac/     # Production APAC (5 replicas, HA, local compliance)
```

## Deployment Strategy

### Progressive Rollout
1. **Dev** → Basic functionality testing
2. **QA** → Integration and performance testing
3. **Preprod** → Production validation
4. **Production** → Multi-region rollout

### Environment Progression
- Each environment inherits from the previous with incremental changes
- Service replicas scale: 1 → 2 → 3 → 5
- Resource limits increase per environment
- Additional features added (monitoring, security, persistence)

## Services per Domain

### Corporate Banking
- `corp-banking-api` (FastAPI)
- `treasury-service` (Go)
- `compliance-service` (Node.js)
- `corp-banking-ui` (React)

### Loans
- `document-processing` (Node.js)
- `credit-scoring` (Python FastAPI)
- `loans-api` (Python FastAPI)
- `loans-ui` (React)

### Retail Banking
- `retail-banking-api` (Node.js)
- `account-service` (Python FastAPI)
- `transaction-service` (Python FastAPI)
- `fraud-detection` (Python FastAPI)
- `logging-service` (Node.js)
- `retail-banking-ui` (React)

## Deployment Commands

### Deploy to specific environment
```bash
# Deploy all services to dev
kubectl apply -f clusters/dev/namespaces/
kubectl apply -f clusters/dev/corporate-banking/
kubectl apply -f clusters/dev/loans/
kubectl apply -f clusters/dev/retail-banking/

# Deploy to production NA
kubectl apply -f clusters/prod-na/namespaces/
kubectl apply -f clusters/prod-na/corporate-banking/
kubectl apply -f clusters/prod-na/loans/
kubectl apply -f clusters/prod-na/retail-banking/
```

### Deploy specific domain
```bash
# Deploy only corporate banking to QA
kubectl apply -f clusters/qa/namespaces/corporate-banking.yaml
kubectl apply -f clusters/qa/corporate-banking/
```

## Environment Variables

Each service receives environment-specific variables:
- `ENVIRONMENT`: dev/qa/preprod/prod-*
- Service URLs for inter-service communication
- Resource limits and requests
- Health check configurations

## Next Steps

These manifests are ready for:
1. **Harness GitOps** - Application Sets and Sync Waves
2. **Argo CD** - Multi-environment deployments
3. **Progressive Delivery** - Canary and blue-green deployments
4. **Policy Enforcement** - OPA policies per environment
5. **Monitoring Integration** - Prometheus/Grafana setup
