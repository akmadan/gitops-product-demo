# Harness GitOps Banking Demo

Banking microservices demo with three business domains: Retail Banking, Corporate Banking, and Loans.

## Apps

### Retail Banking
- **retail-banking-ui** – React customer portal
- **retail-banking-api** – Node.js backend API
- **account-service** – Python account management
- **transaction-service** – Python transaction processing
- **fraud-detection** – Python fraud detection
- **logging-service** – Centralized logging

### Corporate Banking
- **corp-banking-ui** – React corporate portal
- **corp-banking-api** – Python backend
- **treasury-service** – Go treasury management
- **compliance-service** – Node.js compliance checking
- **logging-service** – Corporate logging

### Loans
- **loans-ui** – React loan application portal
- **loans-api** – Python FastAPI backend
- **credit-scoring** – Python credit scoring
- **document-processing** – Node.js document handling
- **logging-service** – Loans logging

## Project Structure

```
gitops-product-demo/
├── apps/                    # Application source code
│   ├── retail-banking/      # retail-banking-ui, retail-banking-api, account-service, transaction-service, fraud-detection, logging-service
│   ├── corporate-banking/   # corp-banking-ui, corp-banking-api, treasury-service, compliance-service
│   └── loans/               # loans-ui, loans-api, credit-scoring, document-processing
├── services/                # Kubernetes manifests (Kustomize base + overlays per env)
│   ├── retail-banking/
│   ├── corporate-banking/
│   └── loans/
├── argocd/                  # Argo CD GitOps config
│   ├── applicationsets/
│   ├── argo-rollouts/
│   ├── monitoring/
│   └── projects/
├── harness-gitops/          # Harness GitOps agent overrides
├── scripts/                 # Build and setup scripts
└── README.md
```

Each service under `services/<domain>/<service>/` has a `base/` (shared manifests) and `overlays/` (dev, qa, preprod, prod-na, prod-eu, prod-apac) for environment-specific config.
