# Configure Static NAT IP for GKE Autopilot Cluster

## Static IP Created

✅ **Static IP Address Created**:
- **Name**: `gitops-qa-nat-ip`
- **IP Address**: `35.193.241.160`
- **Region**: `us-central1`
- **Status**: Ready to use

## Next Steps to Configure NAT Gateway

### Option 1: Update Existing NAT Gateway (If NAT exists)

If there's an existing NAT gateway for the Autopilot router, update it to use the static IP:

```bash
# Get the NAT name
NAT_NAME=$(gcloud compute routers nats list \
  --router=gke-autopilot-router \
  --region=us-central1 \
  --format="get(name)" | head -1)

# Update NAT to use static IP
gcloud compute routers nats update $NAT_NAME \
  --router=gke-autopilot-router \
  --region=us-central1 \
  --nat-ips=gitops-qa-nat-ip \
  --nat-ip-allocation=MANUAL
```

### Option 2: Create New NAT Gateway (If NAT doesn't exist)

If there's no NAT gateway, create one:

```bash
gcloud compute routers nats create gitops-qa-nat \
  --router=gke-autopilot-router \
  --region=us-central1 \
  --nat-ips=gitops-qa-nat-ip \
  --source-subnetwork-ip-ranges-to-nat=ALL_SUBNETWORKS_ALL_IP_RANGES \
  --nat-ip-allocation=MANUAL
```

### Option 3: GKE Autopilot Managed NAT

**Important**: GKE Autopilot clusters may have automatically managed NAT gateways. In this case:

1. **Check if NAT is managed by GKE**:
   ```bash
   gcloud container clusters describe gitops-sko-c1 \
     --region=us-central1 \
     --format="get(networkConfig.defaultSnatStatus)"
   ```

2. **If Default SNAT is enabled**, the cluster uses Cloud NAT automatically
   - You may need to contact GCP support or use a different approach
   - Consider using a **dedicated NAT gateway** for this specific use case

### Option 4: Use a Separate NAT Gateway (Recommended for Autopilot)

For GKE Autopilot, it's often better to create a separate NAT gateway that you control:

```bash
# 1. Create a new Cloud Router (if needed)
gcloud compute routers create gitops-qa-router \
  --network=default \
  --region=us-central1

# 2. Create NAT gateway with static IP
gcloud compute routers nats create gitops-qa-nat \
  --router=gitops-qa-router \
  --region=us-central1 \
  --nat-ips=gitops-qa-nat-ip \
  --source-subnetwork-ip-ranges-to-nat=ALL_SUBNETWORKS_ALL_IP_RANGES \
  --nat-ip-allocation=MANUAL

# 3. Configure cluster subnets to use this NAT
# Note: This may require updating route priorities or subnet configurations
```

## Verify Configuration

After configuring, verify the NAT is using the static IP:

```bash
# Check NAT configuration
gcloud compute routers nats describe gitops-qa-nat \
  --router=gitops-qa-router \
  --region=us-central1 \
  --format="yaml(natIps,natIpAllocateOption)"

# Test egress IP from a pod
kubectl run test-static-nat --image=curlimages/curl --rm -i --restart=Never \
  --namespace=argocd \
  -- curl -s ifconfig.me

# Expected output: 35.193.241.160
```

## Security Team Whitelist Request

Once the static IP is configured and verified, request whitelisting:

```
IP Address: 35.193.241.160
Destination: qa.harness.io
Port: 443 (HTTPS)
Protocol: TCP
Resource Name: gitops-qa-nat-ip
Region: us-central1
```

## Important Notes

1. **IP Stability**: Static IPs remain constant even if NAT gateway is recreated
2. **Cost**: Static IPs have a small monthly cost (~$0.004/hour when in use)
3. **Autopilot Considerations**: GKE Autopilot manages some networking automatically
   - You may need to work with GCP support for custom NAT configurations
   - Alternative: Use a GKE Standard cluster for more control

## Troubleshooting

### If NAT update fails:
- Check router permissions
- Verify the router exists: `gcloud compute routers list --region=us-central1`
- Check if NAT is managed by GKE Autopilot (may require different approach)

### If pods still use old IP:
- Wait 5-10 minutes for changes to propagate
- Restart pods to pick up new NAT configuration
- Check route priorities: `gcloud compute routes list --filter="network:default"`

## Current Status

- ✅ Static IP created: `35.193.241.160`
- ⏳ NAT gateway configuration: **Pending** (choose one of the options above)
- ⏳ Security team whitelist: **Pending** (after NAT is configured)



