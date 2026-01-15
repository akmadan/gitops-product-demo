# Harness GitOps Banking Demo

## Overview
This demo showcases a comprehensive banking sector implementation with microservices architecture, demonstrating the power of Harness GitOps compared to Argo OSS.

## Architecture

### Business Domains
- **Retail Banking**: Customer-facing banking services
- **Corporate Banking**: Enterprise banking solutions  
- **Loans**: Loan processing and management

### Environments
- **Dev**: Development environment with basic deployments
- **QA**: Testing environment with integration capabilities
- **Preprod**: Staging environment with production-like setup
- **Prod-NA**: North America production
- **Prod-EU**: Europe production
- **Prod-APAC**: Asia-Pacific production

## Microservices

### Retail Banking
- `retail-banking-ui` - React customer portal
- `retail-banking-api` - Node.js backend API
- `account-service` - Python account management
- `transaction-service` - Python transaction processing
- `fraud-detection` - Python ML-based (hardcoded for now) fraud detection
- `logging-service` - Centralized logging

### Corporate Banking
- `corp-banking-ui` - React corporate portal
- `corp-banking-api` - Python Core backend
- `treasury-service` - Go treasury management
- `compliance-service` - Node.js compliance checking
- `logging-service` - Corporate logging

### Loans
- `loans-ui` - React loan application portal
- `loans-api` - Python FastAPI backend
- `credit-scoring` - Python Based ML (hardcode for now) credit scoring service
- `document-processing` - Node.js document handling
- `logging-service` - Loans logging

### Infrastructure Services
- `monitoring` - Prometheus + Grafana
- `auth-service` - OAuth2/JWT authentication
- `api-gateway` - Kong API gateway
- `message-queue` - RabbitMQ messaging
- `database` - PostgreSQL + Redis

## Quick Start

### Option 1: Run all services
```bash
docker-compose up --build
```

### Option 2: Run individual domains
```bash
# Corporate Banking only
docker-compose -f docker-compose.corporate.yml up --build

# Loans only  
docker-compose -f docker-compose.loans.yml up --build

# Retail Banking only
docker-compose -f docker-compose.retail.yml up --build
```

### Option 3: Development with hot reload
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Access URLs
- Corporate Banking UI: http://localhost:5173
- Loans UI: http://localhost:5174
- Retail Banking UI: http://localhost:5175

## GitOps with Argo CD

### Progressive Delivery Strategy
- **Dev** → Automatic sync (no approval)
- **QA** → Automatic sync with validation
- **Preprod** → Manual approval required
- **Production** → Manual approval + progressive rollout

### Sync Waves
- **Wave 0**: Namespaces and infrastructure
- **Wave 1**: Core services (APIs, databases)
- **Wave 2**: Business services (banking applications)
- **Wave 3**: UI services (frontend applications)
- **Wave 4**: Multi-region synchronization
- **Wave 5**: Rollback strategies

### Features Demonstrated
- ApplicationSets for multi-environment management
- Canary deployments with traffic splitting
- Blue-green deployments with analysis
- Multi-region synchronization
- Automated rollback strategies
- Approval workflows with gates
- Progressive delivery with analysis

## Directory Structure

```
gitops-product-demo/
├── apps/                          # Application source code
│   ├── retail-banking/
│   ├── corporate-banking/
│   └── loans/
├── clusters/                      # Kubernetes manifests by environment
│   ├── dev/                       # Development (1 replica)
│   ├── qa/                        # Testing (2 replicas)
│   ├── preprod/                   # Staging (3 replicas)
│   ├── prod-na/                   # Production NA (5 replicas)
│   ├── prod-eu/                   # Production EU (5 replicas)
│   └── prod-apac/                 # Production APAC (5 replicas)
├── argocd/                       # Argo CD GitOps configurations
│   ├── applications/               # Individual applications
│   ├── applicationsets/            # Multi-environment ApplicationSets
│   └── projects/                  # Argo CD projects with RBAC
├── docker-compose.yml             # All services (production-like)
├── docker-compose.dev.yml         # All services (development with hot reload)
├── docker-compose.corporate.yml   # Corporate Banking only
├── docker-compose.loans.yml       # Loans only
├── docker-compose.retail.yml      # Retail Banking only
└── README.md
```

## Demo Scenarios

### Argo OSS User Experience
- Multiple UI logins required
- Manual sync management
- Basic GitHub Actions pipeline
- Manual troubleshooting across clusters

### Harness GitOps Experience  
- Single pane of glass dashboard
- Automated service/environment creation
- Built-in pipeline templates
- AI-powered remediation
- OPA policy integration
- Comprehensive audit trails

## Getting Started

1. Clone this repository
2. Set up Harness GitOps agents
3. Import applications using Harness UI
4. Deploy using pipelines or manual sync
5. Monitor through unified dashboard

## Features Demonstrated

- Multi-cluster management
- Application Sets with Git generators
- Argo Rollouts (canary deployments)
- OPA policy enforcement
- AI-powered remediation
- Secret management
- Audit trails and compliance
- Pipeline templates
- Cross-environment promotion
