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
