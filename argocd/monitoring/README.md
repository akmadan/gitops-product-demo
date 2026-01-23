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

### 3. Verify ServiceMonitors are discovered
```bash
kubectl get servicemonitor -n argocd
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

## Prometheus Queries

```promql
argocd_app_info
argocd_app_sync_total
argocd_app_reconcile_duration_seconds
argocd_app_info{sync_status="OutOfSync"}
increase(argocd_app_reconcile_total{phase="Failed"}[1h])
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
