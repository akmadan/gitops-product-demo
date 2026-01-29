# QA Harness Egress IP Whitelist Request

## Cluster Information
- **Cluster Name**: `gitops-sko-c1`
- **Project**: `sales-209522`
- **Region**: `us-central1`
- **Agent Configuration**: Using `qa.harness.io`

## Egress IP Address to Whitelist

### Observed Egress IP
- **IP Address**: `35.193.42.137`
- **Type**: **Ephemeral/Dynamic NAT IP** (automatically allocated by GKE Autopilot)
- **Status**: Confirmed via pod egress test
- **Date Tested**: 2026-01-29
- **Note**: This IP is **NOT** in the static IP address list, indicating it's dynamically allocated

## Current Issue

The gitops-agent pod is experiencing:
- **403 Forbidden** errors when accessing `qa.harness.io`
- **HTML responses** instead of JSON (indicated by "invalid character '<' looking for beginning of value")
- **CrashLoopBackOff** status due to initialization failures

### Root Cause
The egress IP `35.193.42.137` is **NOT whitelisted** for `qa.harness.io`, causing the agent to receive 403 Forbidden responses.

## Action Required

### Security Team Request

Please whitelist the following IP for QA Harness API access:

```
IP Address: 35.193.42.137
Destination: qa.harness.io
Port: 443 (HTTPS)
Protocol: TCP
```

### Harness API Endpoints
- `https://qa.harness.io/gitops/api/*`
- All sub-paths under `/gitops/api/`

## Verification Steps

After whitelisting, verify connectivity:

```bash
# Test from a pod in the cluster
kubectl run test-qa-connectivity --image=curlimages/curl --rm -i --restart=Never \
  --namespace=argocd \
  -- curl -v https://qa.harness.io/gitops/api/v1/agent/health

# Check current egress IP
kubectl run test-egress --image=curlimages/curl --rm -i --restart=Never \
  --namespace=argocd \
  -- curl -s ifconfig.me
```

Expected: Should return `35.193.42.137` and successfully connect to qa.harness.io

## Additional Notes

- The cluster uses **Default SNAT: Enabled** (as shown in cluster networking settings)
- This means pods egress through Cloud NAT or node external IPs
- **IP Type Analysis**: The egress IP `35.193.42.137` is **NOT** found in static IP addresses, which indicates:
  - ✅ **Most likely**: Ephemeral/dynamic NAT IP automatically allocated by GKE Autopilot
  - GKE Autopilot clusters often use automatic IP allocation for Cloud NAT
  - These IPs are managed by Google and may change if the NAT gateway is recreated
  - However, they typically remain stable during normal operations

### Important Considerations

1. **IP Stability**: 
   - Dynamic NAT IPs can change if the NAT gateway is recreated
   - Consider asking security team to whitelist a **range** if IPs change frequently
   - Or set up monitoring to detect IP changes

2. **Alternative Approach**:
   - If IPs change frequently, consider using a **static NAT IP** instead
   - This requires configuring Cloud NAT with a reserved static IP address
   - Static IPs are more predictable for whitelisting

3. **Verification**:
   - The IP `35.193.42.137` was confirmed via pod egress test
   - This is the actual IP that Harness QA sees for requests from this cluster
   - Whitelist this specific IP for immediate resolution

## Next Steps

1. ⏳ **Security team whitelist** - Request whitelisting of `35.193.42.137` for `qa.harness.io`
2. ⏳ **Verify connectivity** - After whitelisting, test from a pod
3. ⏳ **Monitor agent** - Check if gitops-agent pod becomes ready after whitelisting
4. ⏳ **Check logs** - Verify no more 403 errors in agent logs

## Related Clusters

If you have other clusters that need access to `qa.harness.io`, you may need to whitelist their egress IPs as well. Test each cluster's egress IP using:

```bash
kubectl run test-egress --image=curlimages/curl --rm -i --restart=Never \
  --namespace=argocd \
  -- curl -s ifconfig.me
```

