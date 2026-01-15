# Development Environment

## Overview
Development environment with basic deployments for testing and development.

## Services Deployed
- All Corporate Banking services
- All Loans services  
- All Retail Banking services

## Configuration
- Single replica per service
- Basic resource limits
- No persistence (in-memory storage)
- Internal service communication
- No external ingress (for local development)

## Usage
```bash
kubectl apply -f namespaces/
kubectl apply -f corporate-banking/
kubectl apply -f loans/
kubectl apply -f retail-banking/
```

## Access
- Use `kubectl port-forward` to access services locally
- Or configure LoadBalancer services for external access
