const express = require('express');

const app = express();
app.use(express.json());

const serviceName = process.env.SERVICE_NAME || 'compliance-service';
const environment = process.env.ENVIRONMENT || 'local';
const port = Number(process.env.PORT || 8082);

function utcNowISO() {
  return new Date().toISOString();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

app.get('/ready', (req, res) => {
  res.json({ status: 'ok', service: serviceName, environment, time: utcNowISO() });
});

// Demo-friendly compliance policies that can later map to OPA rules in Harness
const policies = [
  {
    policyId: 'POL-001',
    name: 'No production sync after 5 PM',
    severity: 'HIGH',
    description: 'Blocks manual syncs after 17:00 local time for Prod environments',
    enabled: true
  },
  {
    policyId: 'POL-002',
    name: 'Require approval for limit changes',
    severity: 'MEDIUM',
    description: 'Treasury limit changes require dual approval',
    enabled: true
  },
  {
    policyId: 'POL-003',
    name: 'Disallow privileged containers',
    severity: 'HIGH',
    description: 'Kubernetes workloads must not run as privileged',
    enabled: true
  }
];

app.get('/api/v1/policies', (req, res) => {
  res.json({ policies, count: policies.length, as_of: utcNowISO() });
});

// A simple "compliance check" endpoint that returns PASS/WARN/BLOCK
// This is intentionally basic and deterministic for a demo; later we can swap with OPA.
app.post('/api/v1/check', (req, res) => {
  const { environmentType, requestedAt, changeType } = req.body || {};

  if (!environmentType) {
    return res.status(400).json({ error: 'environmentType is required (dev|qa|preprod|prod)' });
  }

  const now = requestedAt ? new Date(requestedAt) : new Date();
  if (Number.isNaN(now.getTime())) {
    return res.status(400).json({ error: 'requestedAt must be a valid datetime string (ISO 8601)' });
  }

  const hour = now.getHours();

  // Demo rule: prod changes after 5 PM => BLOCK
  if (String(environmentType).toLowerCase().startsWith('prod') && hour >= 17) {
    return res.json({
      decision: 'BLOCK',
      policyId: 'POL-001',
      reason: 'Manual syncs to production are blocked after 17:00',
      evaluatedAt: utcNowISO(),
      inputs: { environmentType, requestedAt: now.toISOString(), changeType: changeType || 'unknown' }
    });
  }

  // Demo rule: limit changes => WARN unless approval present
  if (changeType === 'LIMIT_CHANGE') {
    return res.json({
      decision: 'WARN',
      policyId: 'POL-002',
      reason: 'Limit changes should require dual approval',
      evaluatedAt: utcNowISO(),
      inputs: { environmentType, requestedAt: now.toISOString(), changeType }
    });
  }

  return res.json({
    decision: 'PASS',
    evaluatedAt: utcNowISO(),
    inputs: { environmentType, requestedAt: now.toISOString(), changeType: changeType || 'unknown' }
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${serviceName} listening on :${port} (env=${environment})`);
});
