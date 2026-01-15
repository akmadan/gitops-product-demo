#!/bin/bash

# Build and Push Script for Banking Demo
# This script builds and pushes all Docker images to registry

set -e

# Configuration
REGISTRY="${DOCKER_REGISTRY:-docker.io/akshitmadanharness}"
TAG="${DOCKER_TAG:-latest}"
PUSH_IMAGES="${PUSH_IMAGES:-true}"
PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏦 Banking Demo - Build and Push Script${NC}"
echo -e "${YELLOW}Registry: $REGISTRY${NC}"
echo -e "${YELLOW}Tag: $TAG${NC}"
echo -e "${YELLOW}Platform: $PLATFORM${NC}"
echo -e "${YELLOW}Push: $PUSH_IMAGES${NC}"
echo ""

# Function to build and push an image
build_and_push() {
    local service_name=$1
    local dockerfile_path=$2
    local build_context=$3
    local image_name="${REGISTRY}/${service_name}:${TAG}"
    
    echo -e "${GREEN}📦 Building ${service_name}...${NC}"
    
    # Build the image
    docker build --platform "$PLATFORM" -t "$image_name" -f "$dockerfile_path" "$build_context"
    
    if [ "$PUSH_IMAGES" = "true" ]; then
        echo -e "${GREEN}📤 Pushing ${service_name}...${NC}"
        docker push "$image_name"
    fi
    
    echo -e "${GREEN}✅ ${service_name} completed${NC}"
    echo ""
}

# Corporate Banking Services
echo -e "${YELLOW}🏢 Building Corporate Banking Services...${NC}"
build_and_push "corp-banking-api" "./apps/corporate-banking/corp-banking-api/Dockerfile" "./apps/corporate-banking/corp-banking-api"
build_and_push "treasury-service" "./apps/corporate-banking/treasury-service/Dockerfile" "./apps/corporate-banking/treasury-service"
build_and_push "compliance-service" "./apps/corporate-banking/compliance-service/Dockerfile" "./apps/corporate-banking/compliance-service"
build_and_push "corp-banking-ui" "./apps/corporate-banking/corp-banking-ui/Dockerfile" "./apps/corporate-banking/corp-banking-ui"

# Loans Services
echo -e "${YELLOW}💰 Building Loans Services...${NC}"
build_and_push "document-processing" "./apps/loans/document-processing/Dockerfile" "./apps/loans/document-processing"
build_and_push "credit-scoring" "./apps/loans/credit-scoring/Dockerfile" "./apps/loans/credit-scoring"
build_and_push "loans-api" "./apps/loans/loans-api/Dockerfile" "./apps/loans/loans-api"
build_and_push "loans-ui" "./apps/loans/loans-ui/Dockerfile" "./apps/loans/loans-ui"

# Retail Banking Services
echo -e "${YELLOW}🏪 Building Retail Banking Services...${NC}"
build_and_push "retail-banking-api" "./apps/retail-banking/retail-banking-api/Dockerfile" "./apps/retail-banking/retail-banking-api"
build_and_push "account-service" "./apps/retail-banking/account-service/Dockerfile" "./apps/retail-banking/account-service"
build_and_push "transaction-service" "./apps/retail-banking/transaction-service/Dockerfile" "./apps/retail-banking/transaction-service"
build_and_push "fraud-detection" "./apps/retail-banking/fraud-detection/Dockerfile" "./apps/retail-banking/fraud-detection"
build_and_push "retail-logging-service" "./apps/retail-banking/logging-service/Dockerfile" "./apps/retail-banking/logging-service"
build_and_push "retail-banking-ui" "./apps/retail-banking/retail-banking-ui/Dockerfile" "./apps/retail-banking/retail-banking-ui"

echo -e "${GREEN}🎉 All images built and pushed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo -e "   Total images built: 14"
echo -e "   Registry: $REGISTRY"
echo -e "   Tag: $TAG"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo -e "   1. Update image references in Kubernetes manifests"
echo -e "   2. Deploy with: kubectl apply -f clusters/dev/"
echo -e "   3. Or use Argo CD: kubectl apply -f argocd/"
