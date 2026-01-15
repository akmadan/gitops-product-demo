import React from 'react'

import ApiCard from './components/ApiCard.jsx'

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Corporate Banking – API Tester UI</h1>
        <p>
          Uses Vite dev-server proxies:
          {' '}<code>/api/corp</code> → <code>localhost:8080</code>,
          {' '}<code>/api/treasury</code> → <code>localhost:8081</code>,
          {' '}<code>/api/compliance</code> → <code>localhost:8082</code>
        </p>
      </div>

      <div className="grid">
        <ApiCard
          title="corp-banking-api (FastAPI)"
          subtitle="Accounts + approvals"
          actions={[
            {
              key: 'corp-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/corp/health')
            },
            {
              key: 'corp-accounts',
              label: 'GET /api/v1/accounts',
              fields: [
                {
                  key: 'corporateId',
                  label: 'X-Corporate-Id (optional)',
                  placeholder: 'CORP-RETAILBANK-001'
                }
              ],
              defaultInput: { corporateId: '' },
              run: async (http, form) => {
                const headers = {}
                if (form.corporateId) headers['X-Corporate-Id'] = form.corporateId
                const res = await fetch('/api/corp/api/v1/accounts', { headers })
                const payload = await res.json()
                if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, payload })
                return payload
              },
              hint: 'Leave empty to list all mock accounts.'
            },
            {
              key: 'corp-approvals',
              label: 'GET /api/v1/approvals/pending',
              run: (http) => http('GET', '/api/corp/api/v1/approvals/pending')
            },
            {
              key: 'corp-approve',
              label: 'POST /approvals/{id}/approve',
              fields: [
                { key: 'approvalId', label: 'approvalId', placeholder: 'APR-90001' }
              ],
              defaultInput: { approvalId: 'APR-90001' },
              run: (http, form) => http('POST', `/api/corp/api/v1/approvals/${encodeURIComponent(form.approvalId)}/approve`)
            },
            {
              key: 'corp-reject',
              label: 'POST /approvals/{id}/reject',
              fields: [
                { key: 'approvalId', label: 'approvalId', placeholder: 'APR-90002' }
              ],
              defaultInput: { approvalId: 'APR-90002' },
              danger: true,
              run: (http, form) => http('POST', `/api/corp/api/v1/approvals/${encodeURIComponent(form.approvalId)}/reject`)
            }
          ]}
        />

        <ApiCard
          title="treasury-service (Go)"
          subtitle="Rates + positions"
          actions={[
            {
              key: 'treasury-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/treasury/health')
            },
            {
              key: 'treasury-positions',
              label: 'GET /api/v1/treasury/positions',
              run: (http) => http('GET', '/api/treasury/api/v1/treasury/positions')
            },
            {
              key: 'treasury-rates',
              label: 'GET /api/v1/treasury/rates',
              run: (http) => http('GET', '/api/treasury/api/v1/treasury/rates')
            },
            {
              key: 'treasury-hedge',
              label: 'GET /hedge/recommendations',
              run: (http) => http('GET', '/api/treasury/api/v1/treasury/hedge/recommendations')
            }
          ]}
        />

        <ApiCard
          title="compliance-service (Node.js)"
          subtitle="Policies + compliance checks"
          actions={[
            {
              key: 'compliance-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/compliance/health')
            },
            {
              key: 'compliance-policies',
              label: 'GET /api/v1/policies',
              run: (http) => http('GET', '/api/compliance/api/v1/policies')
            },
            {
              key: 'compliance-check',
              label: 'POST /api/v1/check',
              fields: [
                {
                  key: 'environmentType',
                  label: 'environmentType',
                  type: 'select',
                  options: [
                    { label: 'dev', value: 'dev' },
                    { label: 'qa', value: 'qa' },
                    { label: 'preprod', value: 'preprod' },
                    { label: 'prod-na', value: 'prod-na' },
                    { label: 'prod-eu', value: 'prod-eu' },
                    { label: 'prod-apac', value: 'prod-apac' }
                  ]
                },
                {
                  key: 'requestedAt',
                  label: 'requestedAt (optional ISO)',
                  placeholder: '2026-01-14T18:00:00Z'
                },
                {
                  key: 'changeType',
                  label: 'changeType',
                  type: 'select',
                  options: [
                    { label: 'K8S_MANIFEST', value: 'K8S_MANIFEST' },
                    { label: 'HELM', value: 'HELM' },
                    { label: 'LIMIT_CHANGE', value: 'LIMIT_CHANGE' }
                  ]
                }
              ],
              defaultInput: {
                environmentType: 'prod-na',
                requestedAt: '',
                changeType: 'K8S_MANIFEST'
              },
              run: (http, form) =>
                http('POST', '/api/compliance/api/v1/check', {
                  environmentType: form.environmentType,
                  requestedAt: form.requestedAt || undefined,
                  changeType: form.changeType
                }),
              hint: 'Try prod-* with an evening time (>= 17:00 local) to get BLOCK.'
            }
          ]}
        />
      </div>

      <div className="small" style={{ marginTop: 14 }}>
        Tip: run services locally on ports 8080/8081/8082, then run the UI.
      </div>
    </div>
  )
}
