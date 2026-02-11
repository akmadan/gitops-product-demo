#!/bin/bash
set -euo pipefail

############################################
# Harness GitOps BYO Agent Network Policy Setup
############################################

# Defaults
BYO_AGENT_NAMESPACE="${byoAgentNamespace:-argocd}"
ARGO_VERSION="${argoVersion:-v2.10.0}"
GITHUB_PAT="${GITHUB_PAT:-}"

NETWORK_POLICY_FILE="${networkPolicyFile:-scripts/networkpolicy.yaml}"

############################################
# Argument parsing
############################################
while [[ $# -gt 0 ]]; do
  case $1 in
    --namespace|-n)
      BYO_AGENT_NAMESPACE="$2"
      shift 2
      ;;
    --argo-version|-v)
      ARGO_VERSION="$2"
      shift 2
      ;;
    --github-pat|-p)
      GITHUB_PAT="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo "  -n | --namespace       ArgoCD namespace (default: argocd)"
      echo "  -v | --argo-version    ArgoCD version (default: v2.10.0)"
      echo "  -p | --github-pat      GitHub PAT (optional)"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "=========================================="
echo " Harness GitOps BYO Agent Setup"
echo "=========================================="
echo " Namespace     : $BYO_AGENT_NAMESPACE"
echo " Argo Version  : $ARGO_VERSION"
echo "=========================================="
echo ""

############################################
# Step 1: Install / Update ArgoCD
############################################
echo "Step 1: Downloading ArgoCD manifests..."

curl -fSL -o install.yaml \
  "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGO_VERSION}/manifests/install.yaml"

# Replace namespace safely
sed "s/namespace: argocd/namespace: ${BYO_AGENT_NAMESPACE}/g" install.yaml > install_ns.yaml

echo "Applying ArgoCD manifests..."
kubectl apply -f install_ns.yaml -n "$BYO_AGENT_NAMESPACE" || true

############################################
# Step 2: Read Network Policies from local file
############################################
echo ""
echo "Step 2: Reading Network Policies from local file: $NETWORK_POLICY_FILE"

if [[ -f "$NETWORK_POLICY_FILE" ]]; then
  cp "$NETWORK_POLICY_FILE" networkpolicy.yaml
else
  echo "ERROR: Network policy file not found: $NETWORK_POLICY_FILE"
  exit 1
fi

############################################
# Step 3: Template namespace
############################################
echo ""
echo "Step 3: Processing Network Policy templates..."

sed "s/{{ .GitopsNamespace }}/${BYO_AGENT_NAMESPACE}/g" networkpolicy.yaml \
| sed "s/{{[^}]*}}//g" \
> networkpolicy.rendered.yaml

############################################
# Step 4: Validate YAML before apply
############################################
echo ""
echo "Step 4: Validating Network Policies..."
kubectl apply --dry-run=client -f networkpolicy.rendered.yaml

############################################
# Step 5: Apply Network Policies
############################################
echo ""
echo "Step 5: Applying Network Policies..."
kubectl apply -f networkpolicy.rendered.yaml

############################################
# Step 6: Restart ArgoCD Components
############################################
echo ""
echo "Step 6: Restarting ArgoCD components..."

# Check and restart StatefulSet if it exists
if kubectl get statefulset argocd-application-controller -n "$BYO_AGENT_NAMESPACE" &>/dev/null; then
  echo "Restarting argocd-application-controller StatefulSet..."
  kubectl rollout restart statefulset/argocd-application-controller -n "$BYO_AGENT_NAMESPACE"
else
  echo "Warning: argocd-application-controller StatefulSet not found in namespace $BYO_AGENT_NAMESPACE"
fi

# Check and restart Deployments if they exist
for deployment in argocd-applicationset-controller argocd-repo-server argocd-redis; do
  if kubectl get deployment "$deployment" -n "$BYO_AGENT_NAMESPACE" &>/dev/null; then
    echo "Restarting $deployment Deployment..."
    kubectl rollout restart deployment/"$deployment" -n "$BYO_AGENT_NAMESPACE"
  else
    echo "Warning: $deployment Deployment not found in namespace $BYO_AGENT_NAMESPACE"
  fi
done

############################################
# Done
############################################
echo ""
echo "=========================================="
echo " Setup Completed Successfully"
echo "=========================================="
echo ""
echo "Verify:"
echo "  kubectl get networkpolicies -n $BYO_AGENT_NAMESPACE"
echo "  kubectl get pods -n $BYO_AGENT_NAMESPACE"
echo ""
