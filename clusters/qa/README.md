# QA Environment

## Overview
Testing environment with integration capabilities and more realistic configurations.

## Services Deployed
- All Corporate Banking services
- All Loans services  
- All Retail Banking services

## Configuration Differences from Dev
- 2 replicas per service (for testing load balancing)
- Higher resource limits
- Basic persistence for stateful services
- Internal service communication
- Basic monitoring enabled

## Usage
```bash
kubectl apply -f namespaces/
kubectl apply -f corporate-banking/
kubectl apply -f loans/
kubectl apply -f retail-banking/
```

## Access
- Use Ingress or LoadBalancer services for external access
- Monitoring endpoints available for observability
