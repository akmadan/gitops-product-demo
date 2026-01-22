# Argo CD Prometheus Service Monitors

This directory contains Prometheus ServiceMonitor manifests for monitoring Argo CD components.

## Prerequisites

- Prometheus Operator installed in your cluster
- Prometheus instance with label selector configured to discover ServiceMonitors

## Setup Instructions

1. **Identify your Prometheus label** - Find the label selector used by your Prometheus Operator:
   ```bash
   kubectl get prometheus -A -o yaml | grep -A 5 "serviceMonitorSelector"
   ```

2. **Update the release label** - In each ServiceMonitor file, update the `release` label to match your Prometheus instance:
   ```yaml
   labels:
     release: <your-prometheus-instance-name>
   ```

3. **Apply in Argo CD namespace** - Apply these manifests in the namespace where Argo CD is installed:
   ```bash
   # First, identify your Argo CD namespace (usually 'argocd')
   kubectl get ns | grep argocd
   
   # Apply all ServiceMonitors
   kubectl apply -f argocd/monitoring/ -n argocd
   ```

## What's Being Monitored

### Core Services
- **argocd-metrics**: Argo CD server metrics
- **argocd-server-metrics**: API server metrics
- **argocd-repo-server-metrics**: Repository server metrics
- **argocd-applicationset-controller-metrics**: ApplicationSet controller metrics
- **argocd-dex-server**: Dex authentication server metrics
- **argocd-redis-ha-haproxy-metrics**: Redis HA proxy metrics
- **argocd-notifications-controller**: Notifications controller metrics
- **argocd-commit-server-metrics**: Commit server metrics (optional component)

## Viewing Metrics

Once applied, you can access metrics in Prometheus:

1. **Prometheus Dashboard**: Access Prometheus UI and query:
   ```promql
   # Examples:
   argocd_app_info
   argocd_app_reconcile_total
   argocd_git_request_total
   ```

2. **Grafana Dashboards**: Import official Argo CD Grafana dashboards:
   - [Argo CD Dashboards](https://grafana.com/grafana/dashboards/?search=argocd)

3. **Common Queries**:
   ```promql
   # Application sync status
   argocd_app_info{dest_namespace="dev"}
   
   # Application reconciliation duration
   histogram_quantile(0.95, rate(argocd_app_reconcile_duration_seconds_bucket[5m]))
   
   # Failed reconciliations
   increase(argocd_app_reconcile_total{phase="Failed"}[5m])
   ```

## For Dev Cluster Apps

Since you have Argo apps deployed in your cluster:
- These ServiceMonitors will automatically collect metrics from all Argo CD components
- Metrics are scoped to the Argo CD namespace
- You can use label selectors to filter metrics by cluster/environment (via `labels` in ApplicationSet resources)
