# Production North America (prod-na) Environment

## 🚀 Environment Overview

The **prod-na** environment is the primary production cluster for North America, featuring advanced deployment strategies using Argo Rollouts with automated analysis and progressive delivery.

## 📋 Services Overview

### Corporate Banking (4 services)
- **compliance-service** - Canary deployment (10% → 25% → 50% → 100%)
- **corp-banking-api** - Blue-Green deployment with preview
- **corp-banking-ui** - Blue-Green deployment with preview
- **treasury-service** - Canary deployment with automated analysis

### Loans (4 services)
- **credit-scoring** - Canary deployment with ML model accuracy checks
- **document-processing** - Blue-Green deployment with preview
- **loans-api** - Canary deployment with throughput monitoring
- **loans-ui** - Blue-Green deployment with preview

### Retail Banking (6 services)
- **account-service** - Canary deployment with success rate monitoring
- **fraud-detection** - Canary deployment with ML model accuracy checks
- **logging-service** - Blue-Green deployment with preview
- **retail-banking-api** - Canary deployment with latency monitoring
- **retail-banking-ui** - Blue-Green deployment with preview
- **transaction-service** - Canary deployment with fraud detection integration

## 🎯 Deployment Strategies

### Canary Strategy (8 services)
**Gradual rollout with automated analysis:**
1. **10% traffic** → 10 minute pause → Analysis
2. **25% traffic** → 10 minute pause → Analysis  
3. **50% traffic** → 10 minute pause → Analysis
4. **100% traffic** → Full deployment

**Analysis Templates Applied:**
- ✅ Success Rate (≥95%)
- ✅ Error Rate (≤5%)
- ✅ Latency P95 (≤500ms)
- ✅ Throughput (≥100 req/s)
- ✅ Model Accuracy (≥85%) for ML services

### Blue-Green Strategy (6 services)
**Instant switch with preview environment:**
1. Deploy new version to **preview** service
2. Run automated analysis on preview
3. Manual approval required for promotion
4. Switch traffic from **active** to new version
5. Keep old version for rollback (30 seconds)

**Services with Blue-Green:**
- corp-banking-api & corp-banking-ui
- document-processing & loans-ui
- logging-service & retail-banking-ui

## 📊 Production Configuration

### Resources
- **Replicas**: 5 per service (production grade)
- **Memory**: 512Mi-2Gi based on service complexity
- **CPU**: 400m-1600m for optimal performance
- **Health Checks**: Liveness & readiness probes

### Environment Variables
- **ENVIRONMENT**: "prod-na"
- **LOG_LEVEL**: "INFO" (production logging)
- **Database URLs**: Production database connections
- **Service URLs**: Internal service discovery
- **Rate Limits**: Production-grade rate limiting

### Analysis Templates
All canary deployments use these analysis templates:
- **success-rate** - HTTP success rate monitoring
- **latency-threshold** - P95 latency monitoring
- **error-rate** - HTTP error rate monitoring
- **throughput** - Request throughput monitoring
- **model-accuracy** - ML model accuracy monitoring

## 🔄 Deployment Process

### Automated Deployment
```bash
# Apply the prod-na ApplicationSet
kubectl apply -f argocd/applicationsets/prod-na-cluster-appset.yaml

# Apply analysis templates
kubectl apply -f argocd/analysis-templates/
```

### Manual Promotion (Blue-Green)
```bash
# Promote blue-green deployments
kubectl argo rollouts promote corp-banking-api -n corporate-banking
kubectl argo rollouts promote corp-banking-ui -n corporate-banking
kubectl argo rollouts promote document-processing -n loans
kubectl argo rollouts promote loans-ui -n loans
kubectl argo rollouts promote logging-service -n retail-banking
kubectl argo rollouts promote retail-banking-ui -n retail-banking
```

### Rollback Commands
```bash
# Rollback canary deployments
kubectl argo rollouts undo compliance-service -n corporate-banking
kubectl argo rollouts undo treasury-service -n corporate-banking

# Rollback blue-green deployments
kubectl argo rollouts undo corp-banking-api -n corporate-banking
```

## 📈 Monitoring & Observability

### Prometheus Metrics
All services expose metrics for:
- HTTP request rates and response codes
- Request latency distributions
- Error rates and success rates
- ML model accuracy (for ML services)
- Resource utilization

### Alerting
- **Slack notifications** for deployment events
- **Prometheus alerts** for metric thresholds
- **Rollback triggers** for failed analysis

## 🔧 Service Configuration

### Database Connections
- **PostgreSQL**: Production databases with connection pooling
- **MongoDB**: Document storage for loans
- **Redis**: Caching layer for high-performance services

### External Integrations
- **Kafka**: Event streaming for transaction processing
- **Elasticsearch**: Centralized logging and search
- **MinIO**: Object storage for document processing
- **Webhooks**: Alert notifications for fraud detection

## 🚨 Production Considerations

### Security
- **HTTPS** for all external communications
- **Network policies** for service isolation
- **Secrets management** for sensitive data
- **RBAC** for access control

### Performance
- **Horizontal pod autoscaling** based on metrics
- **Resource quotas** per namespace
- **Priority classes** for critical services
- **Graceful shutdown** handling

### Reliability
- **Health checks** with appropriate timeouts
- **Circuit breakers** for external dependencies
- **Retry logic** for transient failures
- **Graceful degradation** strategies

## 📝 Deployment Checklist

### Pre-deployment
- [ ] All tests passing in CI/CD pipeline
- [ ] Security scans completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Rollback plan documented

### During Deployment
- [ ] Monitor canary analysis results
- [ ] Check service health endpoints
- [ ] Verify database connectivity
- [ ] Monitor error rates and latency
- [ ] Validate business metrics

### Post-deployment
- [ ] Full smoke test execution
- [ ] Performance validation
- [ ] Security verification
- [ ] Documentation updates
- [ ] Team notification

## 🎯 Next Steps

1. **Monitor** initial deployments closely
2. **Fine-tune** analysis thresholds based on production metrics
3. **Implement** additional monitoring and alerting
4. **Document** runbooks for common scenarios
5. **Plan** disaster recovery procedures
