# GitHub Actions Argo CD Deployment - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install Script Permissions

```bash
# Make setup script executable
chmod +x .github/workflows/setup-secrets.sh

# Run the setup script
./.github/workflows/setup-secrets.sh
```

### Step 2: Follow Interactive Setup

The script will guide you through:
- Setting kubeconfig secrets for each cluster
- Setting ArgoCD credentials
- Setting ArgoCD server URLs
- Setting Slack webhook (optional)

### Step 3: Verify Configuration

```bash
# List all configured secrets
gh secret list | grep -E "KUBE_CONFIG|ARGOCD|SLACK"
```

### Step 4: Test Workflow

Push to develop branch to trigger workflow:

```bash
git add .
git commit -m "Initialize Argo CD deployment pipeline"
git push origin develop
```

## 📋 Manual Setup (If Script Doesn't Work)

### 1. Get Kubeconfig for Each Cluster

```bash
# For each cluster, get kubeconfig and encode it
cat ~/.kube/config-dev | base64

# Then set secret via GitHub CLI
gh secret set KUBE_CONFIG_DEV --body "base64-encoded-content"
```

### 2. Get ArgoCD Credentials

```bash
# For each ArgoCD instance
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Get ArgoCD server address
kubectl -n argocd get svc argocd-server
```

### 3. Set GitHub Secrets via UI

1. Go to Repository > Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each required secret:
   - KUBE_CONFIG_DEV
   - KUBE_CONFIG_QA
   - KUBE_CONFIG_PREPROD
   - KUBE_CONFIG_PROD_NA
   - KUBE_CONFIG_PROD_EU
   - KUBE_CONFIG_PROD_APAC
   - ARGOCD_USERNAME
   - ARGOCD_PASSWORD
   - ARGOCD_SERVER_DEV
   - ARGOCD_SERVER_QA
   - ARGOCD_SERVER_PREPROD
   - ARGOCD_SERVER_PROD_NA
   - ARGOCD_SERVER_PROD_EU
   - ARGOCD_SERVER_PROD_APAC
   - SLACK_WEBHOOK (optional)

## 🔄 Workflow Triggers

### Automatic Deployments

**Develop Branch (Dev & QA)**
```bash
git checkout develop
git add .
git commit -m "Update services"
git push origin develop
# ✓ Automatically deploys to Dev and QA
```

**Main Branch (Preprod & Production)**
```bash
git checkout main
git merge develop
git push origin main
# ✓ Automatically deploys to Preprod
# ⚠ Production requires manual approval
```

### Manual Deployment

```bash
# Deploy to specific environment
gh workflow run argo-deployment.yml \
  --ref main \
  -f environment=dev

# Or use Actions UI:
# 1. Go to Actions tab
# 2. Select "Argo CD Deployment Pipeline"
# 3. Click "Run workflow"
# 4. Select environment
# 5. Click "Run workflow"
```

## 📊 Monitoring Deployments

### View Workflow Status

```bash
# List recent runs
gh run list -w argo-deployment.yml

# View specific run
gh run view <run-id>

# View run logs
gh run view <run-id> --log

# Watch workflow in real-time
gh run watch <run-id>
```

### Check ArgoCD Applications

```bash
# Port forward to ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# In another terminal, login
argocd login localhost:8080 \
  --username admin \
  --password $(kubectl -n argocd get secret argocd-initial-admin-secret \
    -o jsonpath="{.data.password}" | base64 -d) \
  --insecure

# View applications
argocd app list

# Sync specific app
argocd app sync <app-name>

# Get app status
argocd app get <app-name>
```

## 🐛 Troubleshooting

### Workflow Failed: "Kubeconfig Authentication Failed"

**Cause**: Kubeconfig expired or incorrectly encoded

**Solution**:
```bash
# Update kubeconfig secret
cat ~/.kube/config | base64 | gh secret set KUBE_CONFIG_DEV --body-file -
```

### Workflow Failed: "ArgoCD Login Failed"

**Cause**: Wrong credentials or server URL

**Solution**:
```bash
# Verify ArgoCD is running
kubectl get pods -n argocd | grep argocd-server

# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-server

# Reset ArgoCD credentials
kubectl -n argocd patch secret argocd-secret \
  -p '{"data": {"admin.password": null}}'

# Restart ArgoCD to regenerate password
kubectl rollout restart deployment/argocd-server -n argocd

# Get new password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Workflow Failed: "ApplicationSet Not Found"

**Cause**: ApplicationSet YAML file missing or malformed

**Solution**:
```bash
# Verify ApplicationSet files exist
ls -la argocd/applicationsets/

# Check ApplicationSet syntax
kubectl apply --dry-run=client -f argocd/applicationsets/dev-cluster-appset.yaml

# Verify ApplicationSets are applied
kubectl get ApplicationSet -n argocd
```

### Applications Stuck in "Syncing"

**Cause**: Long-running deployments or resource constraints

**Solution**:
```bash
# Check application status
argocd app get <app-name> --refresh

# View application logs
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Check pod status
kubectl get pods -n <namespace>

# Get pod logs
kubectl logs -n <namespace> <pod-name>
```

## 📝 Best Practices

### 1. Always Test on Dev First

```bash
# Create feature branch
git checkout -b feature/update-services

# Make changes
git add .
git commit -m "Update service version"

# Push to develop for testing
git push origin develop

# Wait for workflow to complete
gh run watch

# Monitor in ArgoCD
argocd app get <app-name> --refresh

# If successful, merge to main
git checkout main
git merge feature/update-services
git push origin main
```

### 2. Use Branch Protection Rules

In GitHub Settings > Branches > Branch protection rules:

1. Add rule for `main` branch
   - ✓ Require a pull request before merging
   - ✓ Require code reviews (2+)
   - ✓ Require status checks to pass
   - ✓ Require branches to be up to date
   - ✓ Include administrators

2. Add rule for `develop` branch
   - ✓ Require a pull request before merging
   - ✓ Require code reviews (1+)
   - ✓ Require status checks to pass

### 3. Monitor Deployment History

```bash
# View deployment history
gh run list -w argo-deployment.yml --limit 10

# Generate deployment report
gh run view <run-id> --log > deployment-report.txt

# Save report to artifacts
gh run download <run-id> --dir artifacts/
```

### 4. Keep Kubeconfigs Secure

- Rotate kubeconfig secrets monthly
- Use service accounts with minimal permissions
- Never commit kubeconfig to repository
- Use GitHub environment protection for production

## 🎯 Advanced Usage

### Custom Deployment Strategy

Edit `.github/workflows/argo-deployment.yml` to customize:

```yaml
# Change sync strategy
argocd app sync <app-name> --force

# Change sync options
argocd app sync <app-name> --strategy-apply

# Use sync waves
argocd app sync <app-name> --sync-option Validate=false
```

### Multi-Environment Promotion

```bash
# Promote changes from dev → qa → preprod → prod

# 1. Test in dev
git push origin develop
# Wait for workflow

# 2. If successful, promote to main
git checkout main
git merge develop
git push origin main
# Wait for workflow
# Approve production deployment

# 3. Verify in all environments
argocd app list | grep -E "dev|qa|preprod|prod"
```

### Slack Notifications

The workflow sends notifications on:
- ✅ Deployment success
- ❌ Deployment failure
- ⏳ Deployment in progress

Customize by editing the `notify-deployment` job in the workflow.

## 🔐 Security Checklist

- [ ] All kubeconfigs use service accounts with minimal permissions
- [ ] ArgoCD credentials use separate service accounts
- [ ] GitHub secrets are encrypted at rest
- [ ] Branch protection rules enabled for main
- [ ] Required reviewers configured for production environment
- [ ] Slack webhooks use secure channels
- [ ] Regular secret rotation schedule established
- [ ] Audit logs reviewed weekly

## 📚 Useful Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Argo CD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [CNCF Best Practices](https://www.cncf.io/blog/)

## 💡 Common Use Cases

### Deploy Specific Application

```bash
# Via GitHub CLI
gh workflow run argo-deployment.yml -f environment=dev

# Then sync only one app
argocd app sync retail-banking-api-dev --force
```

### Rollback Deployment

```bash
# Get previous revision
argocd app history <app-name>

# Rollback to revision
argocd app rollback <app-name> <revision>
```

### Update Image Version

```yaml
# In clusters/dev/retail-banking/retail-banking-api/deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: api
        image: ghcr.io/myrepo/retail-banking-api:v2.0.1  # Update version

# Commit and push
git add .
git commit -m "Update retail-banking-api to v2.0.1"
git push origin develop
# Workflow automatically syncs change
```

---

For detailed setup instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
