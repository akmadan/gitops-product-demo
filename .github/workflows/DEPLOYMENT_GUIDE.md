# GitHub Actions - Argo CD Deployment Pipeline

## Overview

This GitHub Actions workflow provides a complete CI/CD pipeline for managing Argo CD deployments across multiple Kubernetes clusters and environments.

## Workflow Features

### 1. **Manifest Validation**
- Validates Kubernetes manifests using `kubeconform`
- Performs YAML syntax validation
- Ensures ApplicationSets are properly structured

### 2. **Linting & Security**
- Lints Kubernetes manifests
- Validates Helm charts
- Scans for vulnerabilities using Trivy

### 3. **Multi-Environment Deployments**
- **Dev** - Automatic sync on develop branch push
- **QA** - Automatic sync on develop branch push
- **Preprod** - Manual approval required on main branch
- **Prod-NA, Prod-EU, Prod-APAC** - Manual approval required on main branch

### 4. **Progressive Delivery**
- Respects deployment waves defined in manifests
- Synchronizes microservices in correct order
- Validates health of deployed applications

## Required GitHub Secrets

Configure the following secrets in your GitHub repository settings:

### Kubernetes Configuration
```
KUBE_CONFIG_DEV         - Base64 encoded kubeconfig for dev cluster
KUBE_CONFIG_QA          - Base64 encoded kubeconfig for QA cluster
KUBE_CONFIG_PREPROD     - Base64 encoded kubeconfig for preprod cluster
KUBE_CONFIG_PROD_NA     - Base64 encoded kubeconfig for prod NA cluster
KUBE_CONFIG_PROD_EU     - Base64 encoded kubeconfig for prod EU cluster
KUBE_CONFIG_PROD_APAC   - Base64 encoded kubeconfig for prod APAC cluster
```

### ArgoCD Configuration
```
ARGOCD_USERNAME         - ArgoCD admin username
ARGOCD_PASSWORD         - ArgoCD admin password
ARGOCD_SERVER_DEV       - ArgoCD server URL for dev (e.g., localhost:8080)
ARGOCD_SERVER_QA        - ArgoCD server URL for QA
ARGOCD_SERVER_PREPROD   - ArgoCD server URL for preprod
ARGOCD_SERVER_PROD_NA   - ArgoCD server URL for prod NA
ARGOCD_SERVER_PROD_EU   - ArgoCD server URL for prod EU
ARGOCD_SERVER_PROD_APAC - ArgoCD server URL for prod APAC
```

### Notifications
```
SLACK_WEBHOOK           - Slack webhook URL for deployment notifications
```

## How to Set Up Secrets

### 1. Create Kubeconfig Secret

```bash
# Get your kubeconfig and encode it
cat ~/.kube/config | base64 | pbcopy

# Add to GitHub Secrets as KUBE_CONFIG_<ENV>
```

### 2. Create ArgoCD Secrets

```bash
# Get ArgoCD admin credentials
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Get ArgoCD server address
kubectl -n argocd get svc argocd-server
```

### 3. Create Slack Webhook (Optional)

```bash
# In Slack workspace:
# 1. Create a new app or use existing one
# 2. Enable Incoming Webhooks
# 3. Create a new webhook for a channel
# 4. Copy the webhook URL to GitHub Secrets
```

## Workflow Triggers

### Automatic Triggers
- **Push to `develop` branch**: Triggers dev and QA deployments
- **Push to `main` branch**: Triggers preprod and production deployments (requires approval)

### Paths That Trigger Workflow
- `argocd/**` - Any changes in ArgoCD configurations
- `clusters/**` - Any changes in cluster manifests
- `apps/**` - Any changes in application code
- `.github/workflows/argo-deployment.yml` - Changes to workflow itself

### Manual Trigger
Use `workflow_dispatch` to manually trigger deployment to any environment:

```bash
# Via GitHub CLI
gh workflow run argo-deployment.yml -f environment=dev

# Or use GitHub Actions UI: Actions tab → Select workflow → Run workflow
```

## Pipeline Stages

### Stage 1: Validation (All Pushes)
```
validate-manifests
├── Checkout code
├── Validate manifests with kubeconform
├── Validate YAML structure
└── Validate ApplicationSets
```

### Stage 2: Linting (All Pushes)
```
lint-kubernetes
├── Install Helm
└── Lint Helm charts
```

### Stage 3: Security (All Pushes)
```
security-scan
├── Run Trivy scanner
└── Upload SARIF results to GitHub
```

### Stage 4: Dev Deployment (develop branch pushes)
```
sync-argocd-dev
├── Configure kubeconfig
├── Install ArgoCD CLI
├── Login to ArgoCD
├── Apply banking project
├── Apply dev ApplicationSets
├── Sync applications
└── Wait for health
```

### Stage 5: QA Deployment (develop branch pushes)
```
sync-argocd-qa
├── Configure kubeconfig
├── Install ArgoCD CLI
├── Login to ArgoCD
├── Apply banking project
├── Apply QA ApplicationSets
├── Sync applications
└── Wait for health
```

### Stage 6: Production Deployment (main branch pushes, requires approval)
```
sync-argocd-prod
├── Preprod Deployment
│   ├── Configure kubeconfig
│   ├── Apply preprod ApplicationSets
│   ├── Sync applications
│   └── Wait for health
├── Manual Approval
└── Prod NA/EU/APAC Deployments
    ├── Configure kubeconfig
    ├── Apply prod ApplicationSets
    ├── Sync applications
    └── Wait for health
```

### Stage 7: Manual Sync (workflow_dispatch)
```
manual-sync
├── Configure kubeconfig
├── Install ArgoCD CLI
├── Login to ArgoCD
├── Apply banking project
├── Apply environment-specific ApplicationSets
├── Sync applications
├── Wait for health
└── Generate deployment report
```

### Stage 8: Notifications (Always)
```
notify-deployment
└── Send Slack notification
```

## ApplicationSet Names

The workflow applies ApplicationSets for each cluster. Ensure you have these files:

```
argocd/applicationsets/
├── dev-cluster-appset.yaml
├── qa-cluster-appset.yaml
├── preprod-cluster-appset.yaml
├── prod-na-cluster-appset.yaml
├── prod-eu-cluster-appset.yaml
└── prod-apac-cluster-appset.yaml
```

Each ApplicationSet should define applications for the respective cluster.

## Environment Protection

GitHub provides environment protection rules for critical deployments:

### Setting Up Environment Protection

1. Go to `Settings` → `Environments`
2. Create environment: `development`, `qa`, `production`
3. For `production` environment:
   - Enable "Deployment branches" → "Selected branches"
   - Add `main` branch
   - Add required reviewers (2-3 team members)
   - Enable "Dismiss stale pull request approvals"

## Monitoring & Logs

### View Workflow Runs
- GitHub Actions tab → Select workflow → View runs
- Click on individual run to see logs
- Click on job to see detailed step logs

### Key Logs to Check
- **Manifest Validation**: Check for YAML syntax errors
- **ArgoCD Sync**: Check for application deployment status
- **Health Checks**: Ensure all applications become healthy
- **Security Scan**: Review any vulnerabilities found

## Troubleshooting

### Issue: Kubeconfig Authentication Failed
**Solution**: Verify kubeconfig is correctly base64 encoded and current

```bash
# Verify secret encoding
echo "Your_Base64_String" | base64 -d | head -10
```

### Issue: ArgoCD Login Failed
**Solution**: Check credentials and ArgoCD server URL

```bash
# Verify ArgoCD is accessible
curl https://argocd.example.com --insecure -I
```

### Issue: ApplicationSet Not Found
**Solution**: Ensure ApplicationSet file exists and is applied before sync

```bash
# List ApplicationSets
kubectl get ApplicationSet -n argocd

# Debug ApplicationSet
kubectl describe ApplicationSet dev-microservices -n argocd
```

### Issue: Application Sync Timeout
**Solution**: Check application sync policies in manifests

```bash
# Get application status
argocd app get <app-name>

# Get application logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server
```

## Best Practices

1. **Always validate locally first**
   ```bash
   kubectl apply --dry-run=client -f argocd/projects/
   kubectl apply --dry-run=client -f argocd/applicationsets/
   ```

2. **Test on dev first**
   - Push to develop branch
   - Verify dev and QA deployments succeed
   - Then merge to main for production

3. **Monitor deployments**
   - Watch ArgoCD UI for sync status
   - Check application health
   - Review logs for errors

4. **Use feature branches**
   - Create feature branch for changes
   - Push to verify validation passes
   - Create PR for review
   - Merge to deploy

5. **Maintain secrets security**
   - Use GitHub environments for secret scoping
   - Rotate credentials regularly
   - Never commit secrets to repository
   - Use service accounts with minimal permissions

## Advanced Configuration

### Custom Deployment Windows

Edit ApplicationSet sync windows to restrict deployments:

```yaml
syncWindows:
  - kind: allow
    schedule: '0 0 * * *'        # Every midnight
    duration: 4h
    applications:
      - '*'
```

### Canary Deployments

Use ArgoCD Rollouts analysis templates for gradual rollout:

```bash
# View available analysis templates
ls argocd/argo-rollouts/analysis-templates/

# Apply in ApplicationSet
kubectl apply -f argocd/argo-rollouts/analysis-templates/
```

### Progressive Sync

ApplicationSets support sync waves for ordered deployments:

```yaml
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## Support & Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Argo CD Documentation](https://argo-cd.readthedocs.io/)
- [ApplicationSet Documentation](https://argocd-applicationset.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
