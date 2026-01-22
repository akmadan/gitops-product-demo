# GitHub Actions Secrets Configuration

## Overview

This file documents all required secrets for the Argo CD deployment pipeline.

## Required Secrets

### Kubeconfig Secrets

These are base64-encoded kubeconfig files for each cluster.

```
KUBE_CONFIG_DEV         - Kubeconfig for development cluster
KUBE_CONFIG_QA          - Kubeconfig for QA cluster  
KUBE_CONFIG_PREPROD     - Kubeconfig for preprod cluster
KUBE_CONFIG_PROD_NA     - Kubeconfig for North America production
KUBE_CONFIG_PROD_EU     - Kubeconfig for Europe production
KUBE_CONFIG_PROD_APAC   - Kubeconfig for Asia-Pacific production
```

**How to create:**
```bash
# Get kubeconfig and encode to base64
cat ~/.kube/config | base64

# Copy the output and set as GitHub secret
gh secret set KUBE_CONFIG_DEV --body "base64-encoded-content"
```

### ArgoCD Secrets

These are credentials for authenticating with ArgoCD servers.

```
ARGOCD_USERNAME         - ArgoCD admin username (e.g., "admin")
ARGOCD_PASSWORD         - ArgoCD admin password
```

**How to create:**
```bash
# Get ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Set GitHub secrets
gh secret set ARGOCD_USERNAME --body "admin"
gh secret set ARGOCD_PASSWORD --body "your-password-here"
```

### ArgoCD Server URLs

```
ARGOCD_SERVER_DEV       - ArgoCD server URL for dev (e.g., "argocd-dev.example.com:443")
ARGOCD_SERVER_QA        - ArgoCD server URL for QA
ARGOCD_SERVER_PREPROD   - ArgoCD server URL for preprod
ARGOCD_SERVER_PROD_NA   - ArgoCD server URL for prod NA
ARGOCD_SERVER_PROD_EU   - ArgoCD server URL for prod EU
ARGOCD_SERVER_PROD_APAC - ArgoCD server URL for prod APAC
```

**How to create:**
```bash
# Get ArgoCD server address
kubectl -n argocd get svc argocd-server

# Extract the address (internal or external)
ARGOCD_SERVER="argocd-server.argocd.svc.cluster.local:443"

# Set GitHub secret
gh secret set ARGOCD_SERVER_DEV --body "$ARGOCD_SERVER"
```

### Slack Webhook (Optional)

```
SLACK_WEBHOOK           - Slack incoming webhook URL
```

**How to create:**
```bash
# 1. Go to https://api.slack.com/apps
# 2. Create New App or select existing
# 3. Enable Incoming Webhooks
# 4. Create New Webhook to Workspace
# 5. Copy webhook URL and set secret

gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/T.../B.../..."
```

## Setup Checklist

- [ ] All kubeconfig files are accessible and valid
- [ ] ArgoCD is installed on all clusters
- [ ] ArgoCD admin credentials are available
- [ ] ArgoCD servers are accessible from GitHub runners
- [ ] Slack workspace and webhook are configured (optional)

## Important Notes

1. **Security**: 
   - Never commit kubeconfig files to repository
   - Use GitHub encrypted secrets storage
   - Rotate credentials regularly
   - Use service accounts with minimal permissions

2. **Kubeconfig Format**:
   - Must contain cluster CA certificate
   - Must include authentication token or certificate
   - Should point to correct cluster endpoint

3. **ArgoCD Access**:
   - Ensure ArgoCD server is accessible from GitHub runners
   - Use HTTPS with proper certificate validation
   - Or use `--insecure` flag if using self-signed certificates

4. **Slack Webhook**:
   - Only required if you want deployment notifications
   - Webhook URL contains sensitive token - keep it secret
   - Can be revoked and regenerated anytime

## Testing Setup

To verify secrets are correctly configured:

```bash
# List all secrets (names only, not values)
gh secret list

# Test kubeconfig
# In workflow, it will be decoded and used by kubectl
# Check logs for authentication errors

# Test ArgoCD credentials
# In workflow, it will try to login to ArgoCD server
# Check logs for login failures

# Test Slack webhook
# In workflow, it will attempt to send notification
# Check Slack channel for messages
```

## Troubleshooting

### Secret Not Found in Workflow
```bash
# Verify secret exists
gh secret list | grep KUBE_CONFIG_DEV

# If missing, set it
gh secret set KUBE_CONFIG_DEV --body "base64-content"
```

### Kubeconfig Decode Error
```bash
# Verify base64 encoding
echo "base64-string" | base64 -d | head -5
# Should show "apiVersion: v1" and other YAML content

# If error, re-encode:
cat ~/.kube/config | base64 > encoded.txt
gh secret set KUBE_CONFIG_DEV --body "$(cat encoded.txt)"
```

### ArgoCD Login Fails
```bash
# Verify credentials
argocd login argocd.example.com \
  --username admin \
  --password your-password \
  --insecure

# If fails, reset admin password
kubectl -n argocd patch secret argocd-secret \
  -p '{"data": {"admin.password": null}}'
kubectl rollout restart deployment/argocd-server -n argocd

# Get new password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

### Slack Notification Not Sent
```bash
# Verify webhook URL
curl -X POST https://hooks.slack.com/services/T.../B.../... \
  -H 'Content-type: application/json' \
  -d '{"text":"Test message"}'

# If 404 or 410, webhook is invalid or expired
# Regenerate webhook in Slack workspace
```

## Security Best Practices

1. **Use Service Accounts**
   - Create dedicated service accounts for automation
   - Grant minimal required permissions
   - Enable RBAC for fine-grained access control

2. **Rotate Secrets Regularly**
   - Every 90 days for production
   - Every 30 days for development
   - Immediately if compromised

3. **Monitor Secret Usage**
   - Enable GitHub audit logs
   - Monitor ArgoCD authentication logs
   - Set up alerts for failed authentication

4. **Limit Secret Scope**
   - Use environment-specific secrets
   - Restrict secret access to required workflows
   - Enable branch protection for production

5. **Secure Transfer**
   - Always use HTTPS/TLS
   - Verify SSL certificates
   - Use authenticated connections

## Related Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [argo-deployment.yml](argo-deployment.yml) - Workflow definition

---

Last Updated: 2026-01-22
