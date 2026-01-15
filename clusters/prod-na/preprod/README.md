# Preprod Environment

## Overview
Staging environment with production-like setup for final testing before production deployment.

## Services Deployed
- All Corporate Banking services
- All Loans services  
- All Retail Banking services

## Configuration Differences from QA
- 3 replicas per service
- Production-level resource limits
- Full persistence with PVCs
- Horizontal Pod Autoscaling
- Network policies
- Comprehensive monitoring and logging
- Security contexts and RBAC

## Usage
```bash
kubectl apply -f namespaces/
kubectl apply -f corporate-banking/
kubectl apply -f loans/
kubectl apply -f retail-banking/
kubectl apply -f monitoring/
kubectl apply -f networking/
```

## Access
- Ingress controllers with TLS
- External DNS integration
- Full observability stack
