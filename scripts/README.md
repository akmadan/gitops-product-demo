# Build Scripts

This directory contains scripts to build and push Docker images for the banking demo.

## Scripts

### build-images.sh
Main build script that builds all 14 Docker images for all services.

**Usage:**
```bash
# Build with default settings (will prompt for registry)
./scripts/build-images.sh

# Build with custom registry
DOCKER_REGISTRY=docker.io/myusername ./scripts/build-images.sh

# Build with custom tag
DOCKER_TAG=v1.0.0 ./scripts/build-images.sh

# Build without pushing (local only)
PUSH_IMAGES=false ./scripts/build-images.sh

# Build for specific platform
DOCKER_PLATFORM=linux/amd64 ./scripts/build-images.sh
```

**Environment Variables:**
- `DOCKER_REGISTRY`: Docker registry (default: docker.io/yourusername)
- `DOCKER_TAG`: Image tag (default: latest)
- `DOCKER_PLATFORM`: Target platform (default: linux/amd64)
- `PUSH_IMAGES`: Whether to push images (default: true)

### build-images-linux-amd64.sh
Convenience script to build all images specifically for linux/amd64 platform.

**Usage:**
```bash
# Build with default registry
./scripts/build-images-linux-amd64.sh

# Build with custom registry and tag
./scripts/build-images-linux-amd64.sh docker.io/myusername v1.0.0
```

### setup-byoa-network-policy.sh
Sets up network policies for Harness GitOps BYO (Bring Your Own) Agent in an existing ArgoCD cluster. This script resolves RPC connection timeout issues by configuring proper network policies for ArgoCD components.

**Usage:**
```bash
# Basic usage with defaults (namespace: argocd, version: v2.10.0)
./scripts/setup-byoa-network-policy.sh

# Specify namespace
./scripts/setup-byoa-network-policy.sh --namespace my-argocd-namespace

# Specify ArgoCD version
./scripts/setup-byoa-network-policy.sh --argo-version v2.9.0

# With GitHub PAT for private repository access
./scripts/setup-byoa-network-policy.sh --github-pat YOUR_GITHUB_TOKEN

# Using environment variables
export byoAgentNamespace=argocd
export argoVersion=v2.10.0
export GITHUB_PAT=your_token_here
./scripts/setup-byoa-network-policy.sh
```

**What it does:**
1. Downloads and applies ArgoCD manifests to the specified namespace
2. Downloads network policy YAML (from GitHub or uses local file)
3. Processes template variables in network policies
4. Applies network policies to ArgoCD components
5. Restarts ArgoCD components (scales down, waits, scales up)

**Network Policies Created:**
- `argocd-application-controller-network-policy`
- `argocd-applicationset-controller-network-policy`
- `argocd-repo-server-network-policy`
- `argocd-redis-network-policy`

**Prerequisites:**
- `kubectl` configured and connected to your cluster
- Existing ArgoCD installation in the target namespace
- Appropriate permissions to create network policies and scale deployments

**Troubleshooting:**
- If GitHub download fails, the script will use the local `harness-gitops/networkpolicy.yaml` file
- Ensure your cluster has NetworkPolicy support enabled (CNI plugin must support it)
- Verify namespace exists: `kubectl get namespace <namespace>`

## Images Built

### Corporate Banking (4 images)
- `corp-banking-api`
- `treasury-service`
- `compliance-service`
- `corp-banking-ui`

### Loans (4 images)
- `document-processing`
- `credit-scoring`
- `loans-api`
- `loans-ui`

### Retail Banking (6 images)
- `retail-banking-api`
- `account-service`
- `transaction-service`
- `fraud-detection`
- `retail-logging-service`
- `retail-banking-ui`

**Total: 14 images**

## Prerequisites

1. **Docker installed and running**
2. **Docker Hub account** (or your preferred registry)
3. **Logged into registry:**
   ```bash
   docker login
   ```

## Next Steps After Building

1. **Update image references** in Kubernetes manifests:
   ```bash
   # Update all manifests to use your registry
   find clusters/ -name "*.yaml" -exec sed -i '' 's|image: .*:latest|image: yourregistry/service-name:latest|g' {} \;
   ```

2. **Deploy to Kubernetes:**
   ```bash
   # Deploy to dev environment
   kubectl apply -f clusters/dev/namespaces/
   kubectl apply -f clusters/dev/corporate-banking/
   kubectl apply -f clusters/dev/loans/
   kubectl apply -f clusters/dev/retail-banking/
   ```

3. **Or use Argo CD:**
   ```bash
   # Update Argo CD manifests with your registry
   # Then apply Argo CD configurations
   kubectl apply -f argocd/
   ```

## Troubleshooting

### Build Issues
- Ensure Docker daemon is running
- Check available disk space
- Verify build context paths

### Push Issues
- Ensure you're logged into the registry
- Check registry permissions
- Verify registry URL is correct

### Platform Issues
- For multi-platform builds, use Docker Buildx:
  ```bash
  docker buildx create --use
  docker buildx inspect --bootstrap
  ```
