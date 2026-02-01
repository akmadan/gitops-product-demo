# Argo CD Monitoring with Prometheus & Grafana

## Quick Setup

### 1. Install Prometheus Operator (if not already installed)
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

### 2. Apply Argo CD ServiceMonitors
```bash
kubectl apply -f argocd/monitoring/ -n argocd
```

### 3. Apply Argo Rollouts ServiceMonitor
```bash
kubectl apply -f argocd/monitoring/servicemonitor-argo-rollouts.yaml
```

### 4. Verify ServiceMonitors are discovered
```bash
kubectl get servicemonitor -n argocd
kubectl get servicemonitor -n argo-rollouts
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
# Visit http://localhost:9090/targets to check if scraping started
```

## Access Grafana

### Get Admin Password
```bash
kubectl get secret -n monitoring kube-prometheus-stack-grafana -o jsonpath="{.data.admin-password}" | base64 -d && echo
```

### Port-Forward to Grafana
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

Visit: `http://localhost:3000`  
Login: `admin` / `<password-from-above>`

### Import Argo CD Dashboard
1. Go to **Dashboards** → **Import**
2. Enter Dashboard ID: `14584`
3. Select **kube-prometheus-stack** as data source
4. Click **Import**

### Import Argo Rollouts Dashboard
1. Go to **Dashboards** → **Import**
2. Search for "Argo Rollout" or "Kubernetes with Argo Rollout" in Grafana dashboard library
   - Recommended: Dashboard by KAKAOMOBILITY (referring to dashboard 9679)
   - Alternative: Search for dashboard ID related to "Argo Rollout monitoring"
3. Select **kube-prometheus-stack** as data source
4. Click **Import**
5. The dashboard will show:
   - Pods information on your cluster
   - Container Resource Request & Limit status (per cluster, per namespace)
   - Rollout metrics info (per cluster, rollout, namespace)

**Note:** kube-state-metrics is already included in kube-prometheus-stack and provides metrics for deployed resources (memory, CPU utilization, etc.). The Argo Rollouts exporter provides rollout-specific metrics (name, replicas, phase, etc.).

## Argo Rollouts Configuration

### Enable Metrics in Rollouts

To get comprehensive rollout metrics in Prometheus/Grafana, ensure your Rollout resources have proper annotations. The Argo Rollouts controller automatically exports metrics, but you can add labels for better filtering:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: your-rollout
  labels:
    app: your-app
    # Add labels for better dashboard filtering
    namespace: your-namespace
spec:
  # ... rollout spec
```

### Verify Rollout Metrics

Check if rollout metrics are being scraped:
```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
# Visit http://localhost:9090 and search for:
# - argorollouts_rollout_info
# - argorollouts_rollout_replicas
# - argorollouts_rollout_phase
```

## Prometheus Queries

### Argo CD Queries
```promql
argocd_app_info
argocd_app_sync_total
argocd_app_reconcile_duration_seconds
argocd_app_info{sync_status="OutOfSync"}
increase(argocd_app_reconcile_total{phase="Failed"}[1h])
```

### Argo Rollouts Queries
```promql
# Rollout information
argorollouts_rollout_info
argorollouts_rollout_replicas
argorollouts_rollout_phase

# Rollout status by namespace
argorollouts_rollout_phase{namespace="loans"}

# Rollout replicas over time
argorollouts_rollout_replicas{rollout="loans-ui"}

# Failed rollouts
argorollouts_rollout_phase{phase="Degraded"}

# Rollout progress
argorollouts_rollout_available_replicas / argorollouts_rollout_replicas
```

## Access via External IP (LoadBalancer/NodePort)

### Expose Grafana as LoadBalancer
```bash
kubectl patch svc kube-prometheus-stack-grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc -n monitoring kube-prometheus-stack-grafana
```
Visit: `http://<EXTERNAL-IP>`

### Expose Prometheus as LoadBalancer
```bash
kubectl patch svc kube-prometheus-stack-prometheus -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc -n monitoring kube-prometheus-stack-prometheus
```
Visit: `http://<EXTERNAL-IP>:9090`

### Or use NodePort instead
```bash
kubectl patch svc kube-prometheus-stack-grafana -n monitoring -p '{"spec": {"type": "NodePort"}}'
kubectl get svc -n monitoring kube-prometheus-stack-grafana
```
Visit: `http://<NODE-IP>:<NODE-PORT>`
