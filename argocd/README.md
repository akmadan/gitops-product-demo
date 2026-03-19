# Argo CD GitOps Configuration

This directory contains Argo CD configurations for the Harness GitOps banking demo.

## Structure

```
argocd/
├── applicationsets/     
├── projects/           # Argo CD Projects with RBAC
└── README.md
```

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

## Access Argo CD
```bash
# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Default credentials
# Username: admin
# Password: (get with: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
```