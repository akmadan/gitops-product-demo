import React from 'react'

import ApiCard from './components/ApiCard.jsx'

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Retail Banking Portal – API Tester UI</h1>
        <p>
          Uses Vite dev-server proxies:
          {' '}<code>/api/accounts</code> → <code>localhost:8091</code>,
          {' '}<code>/api/transactions</code> → <code>localhost:8092</code>,
          {' '}<code>/api/fraud</code> → <code>localhost:8093</code>,
          {' '}<code>/api/logs</code> → <code>localhost:8094</code>
        </p>
      </div>

      <div className="grid">
        <ApiCard
          title="account-service (FastAPI)"
          subtitle="Customer account management"
          actions={[
            {
              key: 'accounts-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/accounts/health')
            },
            {
              key: 'accounts-list',
              label: 'GET /api/v1/accounts',
              fields: [
                {
                  key: 'customerId',
                  label: 'X-Customer-Id (optional)',
                  placeholder: 'CUST-001'
                }
              ],
              defaultInput: { customerId: '' },
              run: async (http, form) => {
                const headers = {}
                if (form.customerId) headers['X-Customer-Id'] = form.customerId
                const res = await fetch('/api/accounts/api/v1/accounts', { headers })
                const payload = await res.json()
                if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, payload })
                return payload
              },
              hint: 'Leave empty to list all accounts.'
            },
            {
              key: 'accounts-create',
              label: 'POST /api/v1/accounts',
              fields: [
                { key: 'customerId', label: 'customer_id', placeholder: 'CUST-003' },
                { key: 'accountNumber', label: 'account_number', placeholder: '1003' },
                { key: 'initialBalance', label: 'initial_balance', placeholder: '1000.00' },
                { key: 'currency', label: 'currency', placeholder: 'USD' }
              ],
              defaultInput: {
                customerId: 'CUST-003',
                accountNumber: '1003',
                initialBalance: '1000.00',
                currency: 'USD'
              },
              success: true,
              run: (http, form) =>
                http('POST', '/api/accounts/api/v1/accounts', {
                  customer_id: form.customerId,
                  account_number: form.accountNumber,
                  initial_balance: Number(form.initialBalance),
                  currency: form.currency
                })
            },
            {
              key: 'accounts-suspend',
              label: 'PUT /accounts/{id}/suspend',
              fields: [
                { key: 'accountId', label: 'account_id', placeholder: 'ACC-001' }
              ],
              defaultInput: { accountId: 'ACC-001' },
              danger: true,
              run: (http, form) => http('PUT', `/api/accounts/api/v1/accounts/${encodeURIComponent(form.accountId)}/suspend`)
            }
          ]}
        />

        <ApiCard
          title="transaction-service (FastAPI)"
          subtitle="Transaction processing with fraud detection"
          actions={[
            {
              key: 'transactions-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/transactions/health')
            },
            {
              key: 'transactions-list',
              label: 'GET /api/v1/transactions',
              fields: [
                {
                  key: 'accountId',
                  label: 'X-Account-Id (optional)',
                  placeholder: 'ACC-001'
                }
              ],
              defaultInput: { accountId: '' },
              run: async (http, form) => {
                const headers = {}
                if (form.accountId) headers['X-Account-Id'] = form.accountId
                const res = await fetch('/api/transactions/api/v1/transactions', { headers })
                const payload = await res.json()
                if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, payload })
                return payload
              },
              hint: 'Leave empty to list all transactions.'
            },
            {
              key: 'transactions-create',
              label: 'POST /api/v1/transactions',
              fields: [
                { key: 'accountId', label: 'account_id', placeholder: 'ACC-001' },
                { key: 'amount', label: 'amount', placeholder: '150.00' },
                {
                  key: 'transactionType',
                  label: 'transaction_type',
                  type: 'select',
                  options: [
                    { label: 'DEBIT', value: 'DEBIT' },
                    { label: 'CREDIT', value: 'CREDIT' }
                  ]
                },
                { key: 'description', label: 'description', placeholder: 'ATM withdrawal' }
              ],
              defaultInput: {
                accountId: 'ACC-001',
                amount: '150.00',
                transactionType: 'DEBIT',
                description: 'ATM withdrawal'
              },
              success: true,
              run: (http, form) =>
                http('POST', '/api/transactions/api/v1/transactions', {
                  account_id: form.accountId,
                  amount: Number(form.amount),
                  transaction_type: form.transactionType,
                  description: form.description
                })
            }
          ]}
        />

        <ApiCard
          title="fraud-detection (FastAPI)"
          subtitle="ML-based fraud detection (hardcoded logic)"
          actions={[
            {
              key: 'fraud-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/fraud/health')
            },
            {
              key: 'fraud-check',
              label: 'POST /api/v1/check',
              fields: [
                { key: 'transactionId', label: 'transaction_id', placeholder: 'TXN-001' },
                { key: 'accountId', label: 'account_id', placeholder: 'ACC-001' },
                { key: 'amount', label: 'amount', placeholder: '15000.00' },
                {
                  key: 'transactionType',
                  label: 'transaction_type',
                  type: 'select',
                  options: [
                    { label: 'DEBIT', value: 'DEBIT' },
                    { label: 'CREDIT', value: 'CREDIT' }
                  ]
                },
                { key: 'description', label: 'description', placeholder: 'Large transfer' }
              ],
              defaultInput: {
                transactionId: 'TXN-001',
                accountId: 'ACC-001',
                amount: '15000.00',
                transactionType: 'DEBIT',
                description: 'Large transfer'
              },
              run: (http, form) =>
                http('POST', '/api/fraud/api/v1/check', {
                  transaction_id: form.transactionId,
                  account_id: form.accountId,
                  amount: Number(form.amount),
                  transaction_type: form.transactionType,
                  description: form.description
                }),
              hint: 'Try amounts > 10000 to trigger fraud detection.'
            },
            {
              key: 'fraud-model-info',
              label: 'GET /api/v1/model/info',
              run: (http) => http('GET', '/api/fraud/api/v1/model/info')
            }
          ]}
        />

        <ApiCard
          title="logging-service (Node.js)"
          subtitle="Centralized logging for retail services"
          actions={[
            {
              key: 'logs-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/logs/health')
            },
            {
              key: 'logs-query',
              label: 'GET /api/v1/logs',
              fields: [
                {
                  key: 'service',
                  label: 'service (optional)',
                  placeholder: 'transaction-service'
                },
                {
                  key: 'level',
                  label: 'level (optional)',
                  type: 'select',
                  options: [
                    { label: 'error', value: 'error' },
                    { label: 'warn', value: 'warn' },
                    { label: 'info', value: 'info' },
                    { label: 'debug', value: 'debug' }
                  ]
                },
                { key: 'limit', label: 'limit', placeholder: '50' }
              ],
              defaultInput: { service: '', level: '', limit: '50' },
              run: (http, form) => {
                const params = new URLSearchParams()
                if (form.service) params.append('service', form.service)
                if (form.level) params.append('level', form.level)
                if (form.limit) params.append('limit', form.limit)
                return http('GET', `/api/logs/api/v1/logs?${params.toString()}`)
              },
              hint: 'Filter by service and/or log level.'
            },
            {
              key: 'logs-ingest',
              label: 'POST /api/v1/logs',
              fields: [
                {
                  key: 'level',
                  label: 'level',
                  type: 'select',
                  options: [
                    { label: 'error', value: 'error' },
                    { label: 'warn', value: 'warn' },
                    { label: 'info', value: 'info' },
                    { label: 'debug', value: 'debug' }
                  ]
                },
                { key: 'message', label: 'message', placeholder: 'Test log message' },
                { key: 'service', label: 'service', placeholder: 'test-service' }
              ],
              defaultInput: {
                level: 'info',
                message: 'Test log from UI',
                service: 'test-service'
              },
              success: true,
              run: (http, form) =>
                http('POST', '/api/logs/api/v1/logs', {
                  level: form.level,
                  message: form.message,
                  service: form.service,
                  metadata: { source: 'retail-banking-ui' }
                })
            }
          ]}
        />
      </div>

      <div className="small" style={{ marginTop: 14 }}>
        Tip: run services locally on ports 8091/8092/8093/8094, then run UI.
      </div>
    </div>
  )
}
