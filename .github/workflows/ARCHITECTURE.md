# ArgoCD Deployment Pipeline Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  main                    develop                                             │
│   ↓                        ↓                                                  │
│  [Push]                  [Push]                                              │
│   ↓                        ↓                                                  │
│  Approval Gate         Auto Deploy                                           │
│   ↓                        ↓                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
         ↓                      ↓
    [GitHub Actions - Workflow Pipeline]
         ↓                      ↓
    ┌────────────────────────────────────────┐
    │  1. Validation                         │
    │  2. Linting                            │
    │  3. Security Scan                      │
    └────────────────────────────────────────┘
         ↓                      ↓
    Prod Deployment      Dev/QA Deployment
         ↓                      ↓
         ↓              ┌───────┴────────┐
         ↓              ↓                ↓
      Preprod       Dev Cluster     QA Cluster
         ↓
    Manual Approval
         ↓
         ├─→ Prod NA Cluster
         ├─→ Prod EU Cluster
         └─→ Prod APAC Cluster
```

## 📋 Workflow Pipeline

```
GitHub Event (push/dispatch)
        ↓
    ┌───────────────────────────────────────────┐
    │ VALIDATION STAGE                          │
    ├───────────────────────────────────────────┤
    │ • Validate Kubernetes Manifests           │
    │ • Check YAML Syntax                       │
    │ • Verify ApplicationSets                  │
    └───────────────────────────────────────────┘
        ↓ (if successful)
    ┌───────────────────────────────────────────┐
    │ LINTING STAGE                             │
    ├───────────────────────────────────────────┤
    │ • Lint Kubernetes Manifests               │
    │ • Validate Helm Charts                    │
    └───────────────────────────────────────────┘
        ↓ (if successful)
    ┌───────────────────────────────────────────┐
    │ SECURITY STAGE                            │
    ├───────────────────────────────────────────┤
    │ • Run Trivy Scanner                       │
    │ • Upload SARIF to GitHub                  │
    └───────────────────────────────────────────┘
        ↓ (if successful)
    ┌───────────────────────────────────────────┐
    │ BRANCH CHECK                              │
    ├───────────────────────────────────────────┤
    │ develop? → Deploy to Dev & QA             │
    │ main?    → Deploy to Preprod & Prod       │
    │ manual?  → Deploy to selected env         │
    └───────────────────────────────────────────┘
        ↓
    Continue with appropriate deployment...
```

## 🚀 Deployment Pipelines

### Develop Branch → Dev & QA (Automatic)

```
Push to develop
    ↓
Validation ✓
    ↓
Linting ✓
    ↓
Security Scan ✓
    ↓
Parallel Deployment:
├─→ Configure Dev Kubeconfig
│   ├─→ ArgoCD Login
│   ├─→ Apply Project
│   ├─→ Apply ApplicationSets
│   ├─→ Sync Applications
│   └─→ Wait for Health
│
└─→ Configure QA Kubeconfig
    ├─→ ArgoCD Login
    ├─→ Apply Project
    ├─→ Apply ApplicationSets
    ├─→ Sync Applications
    └─→ Wait for Health
        ↓
Deploy Complete ✓
```

### Main Branch → Preprod & Production (Manual Approval)

```
Push to main
    ↓
Validation ✓
    ↓
Linting ✓
    ↓
Security Scan ✓
    ↓
Deploy to Preprod:
├─→ Configure Preprod Kubeconfig
├─→ ArgoCD Login
├─→ Apply Project
├─→ Apply ApplicationSets
├─→ Sync Applications
├─→ Wait for Health
    ↓
⏹️  AWAITING APPROVAL
    ↓
Deploy to Production (Sequential):
├─→ Deploy to Prod NA
│   ├─→ Configure Kubeconfig
│   ├─→ ArgoCD Login
│   ├─→ Apply Project
│   ├─→ Apply ApplicationSets
│   ├─→ Sync Applications
│   └─→ Wait for Health
│
├─→ Deploy to Prod EU
│   ├─→ Configure Kubeconfig
│   ├─→ ArgoCD Login
│   ├─→ Apply Project
│   ├─→ Apply ApplicationSets
│   ├─→ Sync Applications
│   └─→ Wait for Health
│
└─→ Deploy to Prod APAC
    ├─→ Configure Kubeconfig
    ├─→ ArgoCD Login
    ├─→ Apply Project
    ├─→ Apply ApplicationSets
    ├─→ Sync Applications
    └─→ Wait for Health
        ↓
Deploy Complete ✓ (all regions)
```

## 🗂️ ApplicationSet Structure

```
argocd/applicationsets/
├── dev-cluster-appset.yaml
│   └── Creates: 14 applications for dev-gitops-product-demo cluster
│
├── qa-cluster-appset.yaml
│   └── Creates: 14 applications for qa-gitops-product-demo cluster
│
├── preprod-cluster-appset.yaml
│   └── Creates: 14 applications for preprod-gitops-product-demo cluster
│
├── prod-na-cluster-appset.yaml
│   └── Creates: 14 applications for prod-na-gitops-product-demo cluster
│
├── prod-eu-cluster-appset.yaml
│   └── Creates: 14 applications for prod-eu-gitops-product-demo cluster
│
└── prod-apac-cluster-appset.yaml
    └── Creates: 14 applications for prod-apac-gitops-product-demo cluster
```

### Applications per Cluster (14 total)

```
Each ApplicationSet generates applications for:

Corporate Banking (4):
├── compliance-service
├── corp-banking-api
├── corp-banking-ui
└── treasury-service

Loans (4):
├── credit-scoring
├── document-processing
├── loans-api
└── loans-ui

Retail Banking (5):
├── account-service
├── fraud-detection
├── logging-service
├── retail-banking-api
└── retail-banking-ui

Infrastructure (1):
└── namespaces
```

## 🔐 Secrets Flow

```
User runs setup-secrets.sh
        ↓
Collects kubeconfigs and credentials
        ↓
Base64 encodes
        ↓
Sets GitHub Secrets
        ↓
    ┌─────────────────────────────────┐
    │ GitHub Encrypted Secrets Storage │
    └─────────────────────────────────┘
        ↓
    Workflow triggered
        ↓
    Secrets injected into runner
        ↓
    Decoded and used by workflow steps
        ↓
    Login to clusters and ArgoCD
```

## 🎯 Multi-Region Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Deployment                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │   Prod NA          │  │   Prod EU          │               │
│  │ (North America)    │  │   (Europe)         │               │
│  │                    │  │                    │               │
│  │ 14 Apps × 5 Replicas   14 Apps × 5 Replicas          │
│  └────────────────────┘  └────────────────────┘               │
│         ↑                        ↑                              │
│         │ Deploy sequentially    │                              │
│         │ wait for health ✓      │                              │
│         └────────────┬───────────┘                              │
│                      ↓                                           │
│            ┌──────────────────────┐                            │
│            │   Prod APAC          │                            │
│            │(Asia-Pacific)        │                            │
│            │                      │                            │
│            │14 Apps × 5 Replicas  │                            │
│            └──────────────────────┘                            │
│                      ↓                                           │
│             All regions deployed ✓                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Environment Progression

```
Development Stage
├── Dev Cluster (1 replica per service)
│   └── Auto-deploy on develop push
│
└── QA Cluster (2 replicas per service)
    └── Auto-deploy on develop push

Staging Stage
└── Preprod Cluster (3 replicas per service)
    └── Auto-deploy on main push

Production Stage
├── Prod NA (5 replicas per service)
│   └── Manual approval required
├── Prod EU (5 replicas per service)
│   └── Sequential deployment
└── Prod APAC (5 replicas per service)
    └── Sequential deployment
```

## 🔄 Sync Waves

ApplicationSets can define sync waves for ordered deployment:

```
Wave 0: Infrastructure
├── Namespaces
└── RBAC policies

Wave 1: Core Services
├── Databases
├── Message Queues
└── API Gateways

Wave 2: Banking APIs
├── Retail Banking API
├── Corporate Banking API
└── Loans API

Wave 3: Domain Services
├── Account Service
├── Transaction Service
├── Credit Scoring
└── Document Processing

Wave 4: UI Services
├── Retail Banking UI
├── Corporate Banking UI
└── Loans UI
```

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────┐
│         GitHub Actions Security                     │
├─────────────────────────────────────────────────────┤
│ • Branch protection rules (main branch)             │
│ • Required status checks                           │
│ • Environment protection rules (production)        │
│ • Secrets encryption at rest                       │
│ • Audit logs for all secret access                 │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Manifest Validation                        │
├─────────────────────────────────────────────────────┤
│ • kubeconform validation                           │
│ • YAML syntax checking                             │
│ • Schema validation                                │
│ • Security policy scanning (Trivy)                 │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Kubernetes Security                        │
├─────────────────────────────────────────────────────┤
│ • RBAC enforcement                                 │
│ • Network policies                                 │
│ • Pod security policies                            │
│ • Service account permissions                      │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Application Security                       │
├─────────────────────────────────────────────────────┤
│ • Image scanning                                   │
│ • Container security policies                      │
│ • Runtime security monitoring                      │
│ • Access control lists (ACLs)                      │
└─────────────────────────────────────────────────────┘
```

## 📈 Scaling Considerations

```
Current Setup:
├── 6 Clusters
├── 14 Microservices per cluster
├── 84 Total ArgoCD Applications
└── Typical deployment: 1-5 minutes per stage

Scaling Strategy:
├── Horizontal: Add more clusters
│   └── Add new ApplicationSet YAML file
│       └── Update workflow to deploy to new cluster
│
├── Vertical: Add more services per cluster
│   └── Update ApplicationSet generator
│       └── Workflow scales automatically
│
└── Regional: Add more production regions
    └── Add new prod-<region> ApplicationSet
        └── Workflow handles sequential deployment
```

## 🎯 Deployment Checklist for Each Stage

### Pre-Deployment
```
✓ Code reviewed and approved
✓ All tests passing
✓ Manifests validated
✓ Security scan passed
✓ Required approvals obtained (prod only)
```

### During Deployment
```
✓ Monitor workflow logs
✓ Watch ArgoCD sync status
✓ Check application health
✓ Monitor cluster metrics
✓ Be ready to rollback
```

### Post-Deployment
```
✓ Verify all applications healthy
✓ Check logs for errors
✓ Monitor performance metrics
✓ Verify user access
✓ Document deployment summary
```

## 🔍 Monitoring & Observability

```
GitHub Actions
├── Workflow runs (Actions tab)
├── Job status and logs
├── Artifact storage
└── Deployment history

ArgoCD
├── Application sync status
├── Health indicators
├── Deployment analytics
└── Event timeline

Kubernetes
├── Pod status
├── Resource usage
├── Event logs
└── Metrics collection

Slack (optional)
├── Deployment notifications
├── Status updates
├── Error alerts
└── Completion messages
```

---

**Last Updated**: 2026-01-22
