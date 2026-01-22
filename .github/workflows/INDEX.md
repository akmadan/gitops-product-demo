# 🚀 GitHub Actions Argo CD Deployment Pipeline - Complete Setup

Welcome! This directory contains everything you need to set up a production-ready CI/CD pipeline for Argo CD deployments.

## 📚 Documentation Index

| File | Purpose | Audience | Read Time |
|------|---------|----------|-----------|
| **[README.md](README.md)** | Overview & directory guide | Everyone | 5 min |
| **[QUICKSTART.md](QUICKSTART.md)** | Get started in 5 minutes | New users | 5 min |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Complete setup & reference | DevOps Engineers | 15 min |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System architecture & flows | Architects | 10 min |
| **[SECRETS.md](SECRETS.md)** | Secrets configuration | System Admins | 10 min |
| **[argo-deployment.yml](argo-deployment.yml)** | Workflow definition | DevOps/Developers | 20 min |
| **[setup-secrets.sh](setup-secrets.sh)** | Automated setup script | Everyone | - |

## 🎯 Quick Navigation

### I'm New - Where Do I Start?
→ **[QUICKSTART.md](QUICKSTART.md)** - Follow the 5-minute setup guide

### I Need to Configure Secrets
→ **[SECRETS.md](SECRETS.md)** - Secret reference and setup instructions  
→ Run: `./setup-secrets.sh` - Automated setup helper

### I Want to Understand the Architecture
→ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Visual diagrams and flow charts

### I Need Complete Documentation
→ **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive reference

### I Want to Understand the Workflow
→ **[argo-deployment.yml](argo-deployment.yml)** - Full workflow definition

## ⚡ Super Quick Start

```bash
# 1. Make setup script executable
chmod +x setup-secrets.sh

# 2. Run interactive setup
./setup-secrets.sh

# 3. Test the pipeline
git push origin develop

# 4. Monitor deployment
gh run watch
```

That's it! Your ArgoCD deployment pipeline is ready.

## 🏗️ What This Pipeline Does

```
Your Code
    ↓
GitHub Push
    ↓
GitHub Actions Pipeline
    ├─ Validate Manifests
    ├─ Lint Kubernetes Resources
    ├─ Security Scan
    ├─ Deploy to Dev/QA (automatic)
    └─ Deploy to Preprod/Prod (with approval)
    ↓
Argo CD
    ├─ Syncs to Dev Cluster
    ├─ Syncs to QA Cluster
    ├─ Syncs to Preprod Cluster
    ├─ Syncs to Prod NA Cluster
    ├─ Syncs to Prod EU Cluster
    └─ Syncs to Prod APAC Cluster
    ↓
14 Microservices × 6 Clusters = 84 Applications
    ↓
Slack Notification ✓
```

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account with repository access
- [ ] GitHub CLI installed (`gh` command)
- [ ] kubectl configured for all clusters
- [ ] ArgoCD installed on all Kubernetes clusters
- [ ] ArgoCD admin credentials
- [ ] Read/write access to repository settings

## 🔒 Security First

This pipeline includes multiple security layers:

✅ **GitHub Level**
- Branch protection for main branch
- Required status checks
- Environment protection for production
- Encrypted secrets storage

✅ **Manifest Level**
- Kubernetes manifest validation
- YAML syntax checking
- Vulnerability scanning (Trivy)

✅ **Cluster Level**
- RBAC enforcement
- Network policies
- Service account restrictions

✅ **Application Level**
- Image scanning
- Pod security policies
- Runtime monitoring

## 🎓 Learning Path

### Beginner (30 minutes)
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Run `./setup-secrets.sh`
3. Push to develop branch
4. Watch deployment in Actions tab

### Intermediate (1 hour)
1. Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. Study [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. Review [argo-deployment.yml](argo-deployment.yml)
4. Test manual deployment with `workflow_dispatch`

### Advanced (2+ hours)
1. Customize [argo-deployment.yml](argo-deployment.yml) for your needs
2. Add custom validation steps
3. Implement progressive delivery strategies
4. Set up canary deployments with Argo Rollouts

## 🚨 Common Issues & Solutions

| Issue | Solution | Documentation |
|-------|----------|---|
| "Secret not found" | Run setup script again | [SECRETS.md](SECRETS.md) |
| Workflow not triggering | Check branch name | [QUICKSTART.md](QUICKSTART.md#workflow-triggers) |
| ArgoCD login fails | Verify credentials | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| Manifests invalid | Run validation locally | [QUICKSTART.md](QUICKSTART.md#troubleshooting) |

## 🔄 Typical Workflow

```
┌─────────────────────────────────────────┐
│ 1. Create Feature Branch                 │
│    git checkout -b feature/my-change     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 2. Make Changes                          │
│    vim clusters/dev/...                  │
│    git add .                             │
│    git commit -m "Update service"        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 3. Push to Develop                       │
│    git push origin develop               │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 4. Watch Pipeline                        │
│    gh run watch                          │
│    - Validation ✓                        │
│    - Linting ✓                           │
│    - Security ✓                          │
│    - Dev Deploy ✓                        │
│    - QA Deploy ✓                         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 5. Create Pull Request                   │
│    (Develop → Main)                      │
│    - Code review                         │
│    - Approval                            │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 6. Merge to Main                         │
│    git merge develop                     │
│    git push origin main                  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ 7. Production Deployment                 │
│    - Preprod Deploy ✓                    │
│    - Manual Approval                     │
│    - Prod Deploy ✓ (all regions)         │
│    - Slack Notification ✓                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ ✓ Deployment Complete!                  │
│   All 84 apps synced across 6 clusters   │
└─────────────────────────────────────────┘
```

## 📊 Pipeline Statistics

- **Total Microservices**: 14 per cluster
- **Total Clusters**: 6 (Dev, QA, Preprod, Prod-NA, Prod-EU, Prod-APAC)
- **Total Applications**: 84 (14 × 6)
- **Deployment Stages**: 8 (Validation, Lint, Security, Dev, QA, Preprod, Prod, Notify)
- **Parallel Deployments**: Dev & QA (after validation)
- **Sequential Deployments**: Prod regions (for safety)
- **Average Pipeline Time**: 3-8 minutes
- **Manual Approval Gate**: Yes (production only)

## 🎯 Key Features

✨ **Multi-Environment**
- Automatic deployment to Dev & QA
- Manual approval for Preprod & Production

✨ **Progressive Deployment**
- Respects sync waves in manifests
- Health checks after each sync
- Automatic rollback on failure

✨ **Multi-Region**
- Sequential deployment to NA, EU, APAC
- Regional isolation and control
- Disaster recovery ready

✨ **Security**
- Comprehensive manifest validation
- Vulnerability scanning with Trivy
- RBAC and network policies

✨ **Notifications**
- Slack integration (optional)
- GitHub status checks
- Deployment reports

## 📈 Scaling

This setup scales to:
- **10+ clusters** - Add new ApplicationSet files
- **50+ microservices** - Update ApplicationSet generators
- **Global deployment** - Add more production regions
- **Complex workflows** - Extend with custom actions

## 🔗 Related Resources

- [Project README](../README.md)
- [ArgoCD Configuration](../argocd/README.md)
- [Kubernetes Manifests](../clusters/README.md)
- [Microservices](../apps/README.md)

## 💬 FAQ

**Q: Can I modify the workflow?**  
A: Yes! Edit [argo-deployment.yml](argo-deployment.yml) to customize for your needs.

**Q: How do I add a new cluster?**  
A: Create a new ApplicationSet YAML file in `argocd/applicationsets/` and update the workflow.

**Q: What if deployment fails?**  
A: Check logs in GitHub Actions, verify ArgoCD status, and rollback if needed.

**Q: Can I test locally?**  
A: Yes! Use `act` to run workflows locally: `act -j validate-manifests`

**Q: How do I rotate secrets?**  
A: Update secrets in GitHub Settings > Secrets, run `./setup-secrets.sh` again.

## 🆘 Getting Help

1. **Check Documentation**: Search for your issue in relevant docs
2. **Review Logs**: GitHub Actions logs provide detailed error info
3. **Verify Setup**: Run `gh secret list` to confirm configuration
4. **Test Manually**: Use `kubectl` and `argocd` CLIs to debug

## ✅ Success Criteria

Your setup is working when:

- [ ] Workflow runs on push to develop
- [ ] All validation stages pass
- [ ] Applications sync to Dev cluster
- [ ] Applications sync to QA cluster
- [ ] Pushing to main triggers preprod deployment
- [ ] Production deployment requires approval
- [ ] All 14 services running in each cluster
- [ ] Slack notifications received (if enabled)

## 🎉 You're Ready!

```
        ___
       /   \
      | YES |
       \___/
         |
    ┌────┴────┐
    │          │
  Ready    Go!
```

**Next Step**: Follow [QUICKSTART.md](QUICKSTART.md) to get started!

---

**Questions?** Check the relevant documentation file above.  
**Ready to deploy?** Run `./setup-secrets.sh`  
**Want to understand more?** Read [ARCHITECTURE.md](ARCHITECTURE.md)  

**Happy Deploying! 🚀**

---

**Last Updated**: 2026-01-22  
**Maintained By**: Platform Engineering Team  
**License**: Same as project
