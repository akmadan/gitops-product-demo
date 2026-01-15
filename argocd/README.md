# Argo CD GitOps Configuration

This directory contains Argo CD configurations for the Harness GitOps banking demo.

## Structure

```
argocd/
├── applications/         # Individual Argo CD Applications
├── applicationsets/      # ApplicationSets for multi-environment deployments
├── projects/           # Argo CD Projects with RBAC
└── README.md
```

## GitOps Strategy

### Progressive Delivery
1. **Dev** → Automatic sync (no approval)
2. **QA** → Automatic sync with basic validation
3. **Preprod** → Manual approval required
4. **Production** → Manual approval + progressive rollout

### Sync Waves
- **Wave 1**: Infrastructure (namespaces, configmaps)
- **Wave 2**: Core services (APIs, databases)
- **Wave 3**: Business services (banking applications)
- **Wave 4**: UI services (frontend applications)

### Multi-Environment Management
- Single ApplicationSet per domain
- Environment-specific parameter overrides
- Automated promotion between environments
- Rollback capabilities

## Deployment Commands

### Install Argo CD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Deploy GitOps Applications
```bash
# Apply projects first
kubectl apply -f argocd/projects/

# Apply ApplicationSets
kubectl apply -f argocd/applicationsets/

# Apply individual applications (if needed)
kubectl apply -f argocd/applications/
```

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
- **Argo OSS**: Multiple tools, manual setup, basic sync only

### GitOps Best Practices
- Git as single source of truth
- Automated deployments
- Environment separation
- Rollback capabilities
- Audit trails
