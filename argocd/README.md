# Argo CD GitOps Configuration

This directory contains Argo CD configurations for the Harness GitOps banking demo.

## Structure

```
argocd/
├── applications/         # Individual Argo CD Applications (advanced scenarios)
├── applicationsets/      # 14 ApplicationSets for each microservice
├── projects/           # Argo CD Projects with RBAC
└── README.md
```

## GitOps Strategy

### Microservice-Level Applications
Each microservice gets its own Argo CD Application in each cluster:
- **14 microservices** × **6 clusters** = **84 total applications**
- Individual deployment control per service
- Independent rollback capabilities
- Granular monitoring and alerts

### Progressive Delivery
1. **Wave 0**: Namespaces (infrastructure)
2. **Wave 1**: Corporate Banking APIs (corp-banking-api, treasury-service, compliance-service)
3. **Wave 2**: Loans APIs (document-processing, credit-scoring, loans-api)
4. **Wave 3**: Retail Banking APIs (retail-banking-api, account-service, transaction-service, fraud-detection, logging-service)
5. **Wave 4**: UI Services (corp-banking-ui, loans-ui, retail-banking-ui)

### Multi-Cluster Management
- **dev-gitops-product-demo**: Development (1 replica each)
- **qa-gitops-product-demo**: Testing (2 replicas each)
- **preprod-gitops-product-demo**: Staging (3 replicas each)
- **prod-na-gitops-product-demo**: Production North America (5 replicas each)
- **prod-eu-gitops-product-demo**: Production Europe (5 replicas each)
- **prod-apac-gitops-product-demo**: Production APAC (5 replicas each)

## ApplicationSets Created

### Corporate Banking (4 ApplicationSets)
- `corp-banking-api-appset.yaml`
- `treasury-service-appset.yaml`
- `compliance-service-appset.yaml`
- `corp-banking-ui-appset.yaml`

### Loans (4 ApplicationSets)
- `document-processing-appset.yaml`
- `credit-scoring-appset.yaml`
- `loans-api-appset.yaml`
- `loans-ui-appset.yaml`

### Retail Banking (6 ApplicationSets)
- `retail-banking-api-appset.yaml`
- `account-service-appset.yaml`
- `transaction-service-appset.yaml`
- `fraud-detection-appset.yaml`
- `logging-service-appset.yaml`
- `retail-banking-ui-appset.yaml`

### Infrastructure (1 ApplicationSet)
- `namespaces-appset.yaml`

## Deployment Commands

### Install Argo CD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl port-forward svc/argocd-server -n argocd 8090:443

kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

### Deploy All Microservices
```bash
# Apply project first
kubectl apply -f argocd/projects/

# Apply all ApplicationSets (creates 84 applications)
kubectl apply -f argocd/applicationsets/
```

### Applications Created
Each ApplicationSet creates 6 applications (one per cluster):
- `corp-banking-api-dev-gitops-product-demo`
- `corp-banking-api-qa-gitops-product-demo`
- `corp-banking-api-preprod-gitops-product-demo`
- `corp-banking-api-prod-na-gitops-product-demo`
- `corp-banking-api-prod-eu-gitops-product-demo`
- `corp-banking-api-prod-apac-gitops-product-demo`

## Access Argo CD
```bash
# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Default credentials
# Username: admin
# Password: (get with: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
```

## Features Demonstrated

### Harness vs Argo OSS
- **Harness**: Unified UI, built-in approvals, progressive delivery
- **Argo OSS**: 84 separate applications to manage, manual setup per service

### GitOps Best Practices
- Git as single source of truth
- Individual microservice control
- Environment separation
- Rollback capabilities per service
- Audit trails per application
