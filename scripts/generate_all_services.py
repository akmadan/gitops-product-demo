#!/usr/bin/env python3
"""
Complete Kustomize structure generator for all 14 microservices
- Base: Deployment (dev/qa/preprod)
- Prod overlays: Rollout with canary/blueGreen
"""

from pathlib import Path

BASE_PATH = Path("/Users/akshitmadan/Documents/Harness_Docs/gitops-product-demo")
SERVICES_PATH = BASE_PATH / "services"

SERVICES = {
    "corporate-banking": {
        "namespace": "corporate-banking",
        "services": {
            "compliance-service": {"port": 8082, "strategy": "canary"},
            "corp-banking-api": {"port": 8080, "strategy": "blueGreen"},
            "corp-banking-ui": {"port": 80, "strategy": "blueGreen"},
            "treasury-service": {"port": 8081, "strategy": "canary"},
        }
    },
    "loans": {
        "namespace": "loans",
        "services": {
            "credit-scoring": {"port": 8085, "strategy": "canary"},
            "document-processing": {"port": 8084, "strategy": "blueGreen"},
            "loans-api": {"port": 8083, "strategy": "canary"},
            "loans-ui": {"port": 80, "strategy": "blueGreen"},
        }
    },
    "retail-banking": {
        "namespace": "retail-banking",
        "services": {
            "account-service": {"port": 8091, "strategy": "canary"},
            "fraud-detection": {"port": 8093, "strategy": "canary"},
            "logging-service": {"port": 8094, "strategy": "blueGreen"},
            "retail-banking-api": {"port": 8090, "strategy": "canary"},
            "retail-banking-ui": {"port": 80, "strategy": "blueGreen"},
            "transaction-service": {"port": 8092, "strategy": "canary"},
        }
    }
}

ENVIRONMENTS = ["dev", "qa", "preprod", "prod-eu", "prod-na", "prod-apac"]
ENV_REPLICAS = {"dev": 1, "qa": 2, "preprod": 3, "prod-eu": 5, "prod-na": 5, "prod-apac": 5}
PROD_ENVS = {"prod-eu", "prod-na", "prod-apac"}

def write_file(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

def base_deployment(svc, port):
    """Base Deployment for dev/qa/preprod"""
    return f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {svc}
  labels:
    app: {svc}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {svc}
  template:
    metadata:
      labels:
        app: {svc}
    spec:
      containers:
      - name: {svc}
        image: docker.io/akshitmadanharness/{svc}:latest
        ports:
        - containerPort: {port}
        resources:
          requests:
            memory: "512Mi"
            cpu: "400m"
          limits:
            memory: "1Gi"
            cpu: "800m"
        livenessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {port}
          initialDelaySeconds: 5
          periodSeconds: 5
"""

def base_service(svc, port, strategy):
    """Base Service"""
    if strategy == "blueGreen":
        return f"""apiVersion: v1
kind: Service
metadata:
  name: {svc}-active
  labels:
    app: {svc}
spec:
  selector:
    app: {svc}
  ports:
  - name: http
    port: 80
    targetPort: {port}
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: {svc}-preview
  labels:
    app: {svc}
spec:
  selector:
    app: {svc}
  ports:
  - name: http
    port: 80
    targetPort: {port}
  type: ClusterIP
"""
    return f"""apiVersion: v1
kind: Service
metadata:
  name: {svc}
  labels:
    app: {svc}
spec:
  selector:
    app: {svc}
  ports:
  - name: http
    port: 80
    targetPort: {port}
  type: ClusterIP
"""

def base_configmap(svc):
    """Base ConfigMap"""
    return f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: {svc}-config
  labels:
    app: {svc}
data:
  LOG_LEVEL: "INFO"
"""

def base_kustomization(svc):
    """Base kustomization.yaml"""
    return f"""apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml
  - service.yaml
  - configmap.yaml

commonLabels:
  app: {svc}
"""

def dev_qa_preprod_overlay(svc, env, namespace, replicas):
    """Non-prod overlay (uses Deployment)"""
    return f"""apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: {namespace}

bases:
  - ../../base

commonLabels:
  environment: {env}

replicas:
  - name: {svc}
    count: {replicas}

patches:
  - target:
      kind: Deployment
      name: {svc}
    patch: |-
      - op: add
        path: /spec/template/spec/containers/0/env
        value:
          - name: ENVIRONMENT
            value: "{env}"
  - target:
      kind: ConfigMap
      name: {svc}-config
    patch: |-
      - op: add
        path: /data/ENVIRONMENT
        value: "{env}"
"""

def prod_overlay_with_rollout(svc, port, strategy, env, namespace, replicas):
    """Prod overlay (replaces with Rollout)"""
    if strategy == "blueGreen":
        strategy_block = f"""    blueGreen:
      activeService: {svc}-active
      previewService: {svc}-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30"""
    else:
        strategy_block = """    canary:
      maxSurge: '25%'
      maxUnavailable: 0
      steps:
        - setWeight: 10
        - pause: { duration: 10m }
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }
        - setWeight: 100"""
    
    rollout = f"""apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: {svc}
  labels:
    app: {svc}
    strategy: {strategy}
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {svc}
  template:
    metadata:
      labels:
        app: {svc}
    spec:
      containers:
      - name: {svc}
        image: docker.io/akshitmadanharness/{svc}:latest
        ports:
        - containerPort: {port}
        env:
        - name: ENVIRONMENT
          value: "{env}"
        resources:
          requests:
            memory: "512Mi"
            cpu: "400m"
          limits:
            memory: "1Gi"
            cpu: "800m"
        livenessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: {port}
          initialDelaySeconds: 5
          periodSeconds: 5
  minReadySeconds: 30
  revisionHistoryLimit: 3
  strategy:
{strategy_block}
"""
    
    return f"""apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: {namespace}

bases:
  - ../../base

commonLabels:
  environment: {env}

resources:
  - rollout.yaml

patches:
  - target:
      kind: Deployment
      name: {svc}
    patch: |-
      - op: remove
        path: /
  - target:
      kind: ConfigMap
      name: {svc}-config
    patch: |-
      - op: add
        path: /data/ENVIRONMENT
        value: "{env}"

---
{rollout}
"""

def main():
    print("🚀 Generating complete Kustomize structure...\n")
    total = 0
    
    for domain, cfg in SERVICES.items():
        ns = cfg["namespace"]
        print(f"📁 {domain}/")
        
        for svc, scfg in cfg["services"].items():
            port, strategy = scfg["port"], scfg["strategy"]
            base_dir = SERVICES_PATH / domain / svc / "base"
            
            # Write base files
            write_file(base_dir / "deployment.yaml", base_deployment(svc, port))
            write_file(base_dir / "service.yaml", base_service(svc, port, strategy))
            write_file(base_dir / "configmap.yaml", base_configmap(svc))
            write_file(base_dir / "kustomization.yaml", base_kustomization(svc))
            total += 4
            
            # Write overlay files
            for env in ENVIRONMENTS:
                overlay_dir = SERVICES_PATH / domain / svc / "overlays" / env
                replicas = ENV_REPLICAS[env]
                
                if env in PROD_ENVS:
                    content = prod_overlay_with_rollout(svc, port, strategy, env, ns, replicas)
                else:
                    content = dev_qa_preprod_overlay(svc, env, ns, replicas)
                
                write_file(overlay_dir / "kustomization.yaml", content)
                total += 1
            
            print(f"  ✓ {svc}")
        print()
    
    print(f"✅ Created {total} files")

if __name__ == "__main__":
    main()