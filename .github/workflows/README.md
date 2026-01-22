# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the GitOps banking demo project.

## 📁 Files Overview

### `argo-deployment.yml`
Main workflow file that orchestrates Argo CD deployments across all clusters.

**Features:**
- Multi-stage pipeline: validation → linting → security → deployment
- Environment-based deployment (dev, qa, preprod, production)
- Progressive rollout to multiple cloud regions
- Manual approval gates for production
- Health checks and sync validation

**Triggers:**
- Push to `develop` branch: Deploys to dev & QA
- Push to `main` branch: Deploys to preprod & production (requires approval)
- `workflow_dispatch`: Manual deployment to any environment

### `QUICKSTART.md`
Quick start guide to get the pipeline running in 5 minutes.

**Contents:**
- Quick setup steps
- Manual configuration instructions
- Workflow trigger examples
- Monitoring commands
- Troubleshooting guide

### `DEPLOYMENT_GUIDE.md`
Comprehensive deployment and setup guide.

**Contents:**
- Full pipeline overview
- All required secrets documentation
- Setup instructions
- Pipeline stages explained
- Advanced configurations
- Best practices

### `SECRETS.md`
Detailed secrets configuration reference.

**Contents:**
- Required secrets list
- Secret creation instructions
- Testing and verification
- Security best practices
- Troubleshooting

### `setup-secrets.sh`
Interactive bash script to configure GitHub secrets automatically.

**Features:**
- Prerequisites checking
- Interactive secret input
- Automatic secret setting via GitHub CLI
- Verification of configured secrets
- GitHub environments setup helper

## 🚀 Getting Started

### 1. Quick Start (Recommended)
```bash
# Make script executable
chmod +x setup-secrets.sh

# Run setup script
./setup-secrets.sh
```

### 2. Manual Setup
Follow instructions in [QUICKSTART.md](QUICKSTART.md)

### 3. Detailed Setup
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📋 Required Secrets

### Essential
- `KUBE_CONFIG_DEV` - Dev cluster kubeconfig
- `KUBE_CONFIG_QA` - QA cluster kubeconfig
- `ARGOCD_USERNAME` - ArgoCD username
- `ARGOCD_PASSWORD` - ArgoCD password
- `ARGOCD_SERVER_DEV` - Dev ArgoCD server URL
- `ARGOCD_SERVER_QA` - QA ArgoCD server URL

### Production (If Deploying to Production)
- `KUBE_CONFIG_PREPROD` - Preprod cluster kubeconfig
- `KUBE_CONFIG_PROD_NA` - Prod NA cluster kubeconfig
- `KUBE_CONFIG_PROD_EU` - Prod EU cluster kubeconfig
- `KUBE_CONFIG_PROD_APAC` - Prod APAC cluster kubeconfig
- `ARGOCD_SERVER_PREPROD` - Preprod ArgoCD server
- `ARGOCD_SERVER_PROD_NA` - Prod NA ArgoCD server
- `ARGOCD_SERVER_PROD_EU` - Prod EU ArgoCD server
- `ARGOCD_SERVER_PROD_APAC` - Prod APAC ArgoCD server

### Optional
- `SLACK_WEBHOOK` - Slack webhook for notifications

See [SECRETS.md](SECRETS.md) for detailed secret setup.

## 🔄 Deployment Flow

```
Feature Branch
    ↓
Push to develop
    ↓
Validation (manifests, linting, security)
    ↓
Deploy to Dev & QA (automatic)
    ↓
Pull Request to main
    ↓
Code Review & Approval
    ↓
Merge to main
    ↓
Push to main
    ↓
Validation (manifests, linting, security)
    ↓
Deploy to Preprod (automatic)
    ↓
Manual Approval for Production
    ↓
Deploy to Prod NA/EU/APAC (sequential)
    ↓
Deployment Complete ✓
```

## 🎯 Common Tasks

### Deploy to Development
```bash
git checkout develop
git add .
git commit -m "Update service"
git push origin develop
# ✓ Automatically deploys
```

### Promote to Production
```bash
git checkout main
git merge develop
git push origin main
# ✓ Deploys to preprod
# ⚠ Waits for manual approval for production
```

### Manual Deployment
```bash
# Via GitHub CLI
gh workflow run argo-deployment.yml -f environment=qa

# Via GitHub UI:
# 1. Actions tab
# 2. "Argo CD Deployment Pipeline"
# 3. "Run workflow"
# 4. Select environment
# 5. "Run workflow"
```

### View Workflow Status
```bash
# List recent runs
gh run list -w argo-deployment.yml

# View specific run
gh run view <run-id>

# Watch in real-time
gh run watch <run-id>
```

## 📊 Pipeline Stages

### Stage 1: Validation
Validates all Kubernetes manifests and YAML files
- kubeconform validation
- YAML syntax checking
- ApplicationSet verification

### Stage 2: Linting
Checks manifest quality and best practices
- Helm chart linting
- Manifest standards

### Stage 3: Security
Scans for vulnerabilities and security issues
- Trivy vulnerability scanning
- SARIF results upload to GitHub

### Stage 4-5: Dev & QA Deployment
Automatically deploys to dev and QA clusters
- Applies projects and ApplicationSets
- Syncs applications
- Waits for healthy status

### Stage 6: Production Deployment
Deploys to preprod and production (with approval)
- Preprod: Automatic deployment
- Production: Requires manual approval
- Deploys to NA, EU, APAC regions sequentially

### Stage 7: Manual Sync
Allows manual deployment to any environment
- Environment selection
- Deployment report generation

### Stage 8: Notifications
Sends deployment status to Slack

## 🔐 Security

- All secrets encrypted and stored securely in GitHub
- Branch protection rules recommended for `main`
- Environment protection rules for production
- RBAC enforced at Kubernetes level
- Audit logs available in GitHub

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `argo-deployment.yml` | Workflow definition | DevOps/Platform teams |
| `QUICKSTART.md` | Get started in 5 minutes | New users |
| `DEPLOYMENT_GUIDE.md` | Complete setup guide | DevOps engineers |
| `SECRETS.md` | Secrets configuration | System admins |
| `setup-secrets.sh` | Automated setup | Everyone |
| `README.md` | This file | Everyone |

## 🐛 Troubleshooting

### Common Issues

**Workflow not triggering?**
- Verify branch name is `develop` or `main`
- Check file paths match trigger conditions
- Enable workflows in repository settings

**Secret not found?**
- Verify secret name matches exactly
- Check secret scope (repository vs environment)
- Recreate secret if corrupted

**Deployment failed?**
- Check workflow logs in GitHub Actions
- Verify kubeconfig is current
- Ensure ArgoCD is accessible

See [QUICKSTART.md](QUICKSTART.md#-troubleshooting) for detailed troubleshooting.

## ✅ Pre-flight Checklist

- [ ] ArgoCD installed on all clusters
- [ ] All kubeconfigs are valid and current
- [ ] ArgoCD credentials are correct
- [ ] GitHub secrets are configured
- [ ] Branch protection rules are set up
- [ ] Environment protection rules are configured (production)
- [ ] Slack webhook configured (optional)
- [ ] GitHub Actions enabled in repository

## 🔗 Related Documentation

- [Project README](../README.md)
- [ArgoCD Documentation](../argocd/README.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Argo CD Official Docs](https://argo-cd.readthedocs.io/)

## 📞 Support

For issues or questions:
1. Check [QUICKSTART.md](QUICKSTART.md#-troubleshooting)
2. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Check GitHub Actions logs
4. Review workflow definition in `argo-deployment.yml`

## 🎓 Learning Resources

- [GitHub Actions Tutorial](https://docs.github.com/en/actions/guides)
- [Argo CD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [GitOps Principles](https://www.gitops.tech/)

---

**Last Updated**: 2026-01-22  
**Maintained By**: Platform Team
