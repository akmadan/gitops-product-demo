#!/bin/bash

# Quick build script for linux/amd64 platform
# Usage: ./build-images-linux-amd64.sh [registry] [tag]

set -e

# Default values
REGISTRY="${1:-docker.io/akshitmadanharness}"
TAG="${2:-latest}"

echo "🏦 Building all banking demo images for linux/amd64"
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo ""

# Export environment variables for the main script
export DOCKER_REGISTRY="$REGISTRY"
export DOCKER_TAG="$TAG"
export DOCKER_PLATFORM="linux/amd64"
export PUSH_IMAGES="true"

# Run the main build script
./scripts/build-images.sh
