import React from 'react'

import ApiCard from './components/ApiCard.jsx'

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>Loans Portal – API Tester UI</h1>
        <p>
          Uses Vite dev-server proxies:
          {' '}<code>/api/loans</code> → <code>localhost:8083</code>,
          {' '}<code>/api/scoring</code> → <code>localhost:8085</code>,
          {' '}<code>/api/docs</code> → <code>localhost:8084</code>
        </p>
      </div>

      <div className="grid">
        <ApiCard
          title="loans-api (FastAPI)"
          subtitle="Loan applications management"
          actions={[
            {
              key: 'loans-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/loans/health')
            },
            {
              key: 'loans-list',
              label: 'GET /api/v1/applications',
              fields: [
                {
                  key: 'applicantId',
                  label: 'X-Applicant-Id (optional)',
                  placeholder: 'CUST-001'
                }
              ],
              defaultInput: { applicantId: '' },
              run: async (http, form) => {
                const headers = {}
                if (form.applicantId) headers['X-Applicant-Id'] = form.applicantId
                const res = await fetch('/api/loans/api/v1/applications', { headers })
                const payload = await res.json()
                if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, payload })
                return payload
              },
              hint: 'Leave empty to list all applications.'
            },
            {
              key: 'loans-create',
              label: 'POST /api/v1/applications',
              fields: [
                { key: 'applicantId', label: 'applicantId', placeholder: 'CUST-001' },
                { key: 'loanAmount', label: 'loanAmount', placeholder: '25000' },
                {
                  key: 'loanPurpose',
                  label: 'loanPurpose',
                  type: 'select',
                  options: [
                    { label: 'HOME_LOAN', value: 'HOME_LOAN' },
                    { label: 'AUTO_LOAN', value: 'AUTO_LOAN' },
                    { label: 'PERSONAL', value: 'PERSONAL' },
                    { label: 'BUSINESS', value: 'BUSINESS' }
                  ]
                },
                { key: 'termMonths', label: 'termMonths', placeholder: '36' },
                { key: 'incomeAnnual', label: 'incomeAnnual', placeholder: '75000' },
                { key: 'debtExisting', label: 'debtExisting', placeholder: '15000' },
                {
                  key: 'employmentType',
                  label: 'employmentType',
                  type: 'select',
                  options: [
                    { label: 'FULL_TIME', value: 'FULL_TIME' },
                    { label: 'PART_TIME', value: 'PART_TIME' },
                    { label: 'SELF_EMPLOYED', value: 'SELF_EMPLOYED' },
                    { label: 'UNEMPLOYED', value: 'UNEMPLOYED' }
                  ]
                },
                { key: 'creditHistoryYears', label: 'creditHistoryYears', placeholder: '8' },
                { key: 'numCreditLines', label: 'numCreditLines', placeholder: '5' },
                { key: 'recentDelinquencies', label: 'recentDelinquencies', placeholder: '0' }
              ],
              defaultInput: {
                applicantId: 'CUST-001',
                loanAmount: '25000',
                loanPurpose: 'PERSONAL',
                termMonths: '36',
                incomeAnnual: '75000',
                debtExisting: '15000',
                employmentType: 'FULL_TIME',
                creditHistoryYears: '8',
                numCreditLines: '5',
                recentDelinquencies: '0'
              },
              run: (http, form) =>
                http('POST', '/api/loans/api/v1/applications', {
                  applicant_id: form.applicantId,
                  loan_amount: Number(form.loanAmount),
                  loan_purpose: form.loanPurpose,
                  term_months: Number(form.termMonths),
                  income_annual: Number(form.incomeAnnual),
                  debt_existing: Number(form.debtExisting),
                  employment_type: form.employmentType,
                  credit_history_length_years: Number(form.creditHistoryYears),
                  num_credit_lines: Number(form.numCreditLines),
                  recent_delinquencies: Number(form.recentDelinquencies)
                })
            },
            {
              key: 'loans-approve',
              label: 'POST /applications/{id}/approve',
              fields: [
                { key: 'applicationId', label: 'applicationId', placeholder: 'APP-001' }
              ],
              defaultInput: { applicationId: 'APP-001' },
              success: true,
              run: (http, form) => http('POST', `/api/loans/api/v1/applications/${encodeURIComponent(form.applicationId)}/approve`)
            },
            {
              key: 'loans-reject',
              label: 'POST /applications/{id}/reject',
              fields: [
                { key: 'applicationId', label: 'applicationId', placeholder: 'APP-002' }
              ],
              defaultInput: { applicationId: 'APP-002' },
              danger: true,
              run: (http, form) => http('POST', `/api/loans/api/v1/applications/${encodeURIComponent(form.applicationId)}/reject`)
            }
          ]}
        />

        <ApiCard
          title="credit-scoring (FastAPI)"
          subtitle="ML-based credit scoring (hardcoded logic)"
          actions={[
            {
              key: 'scoring-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/scoring/health')
            },
            {
              key: 'scoring-score',
              label: 'POST /api/v1/score',
              fields: [
                { key: 'applicantId', label: 'applicantId', placeholder: 'APP-001' },
                { key: 'incomeAnnual', label: 'incomeAnnual', placeholder: '75000' },
                { key: 'debtExisting', label: 'debtExisting', placeholder: '15000' },
                { key: 'creditHistoryYears', label: 'creditHistoryYears', placeholder: '8' },
                { key: 'numCreditLines', label: 'numCreditLines', placeholder: '5' },
                { key: 'recentDelinquencies', label: 'recentDelinquencies', placeholder: '0' },
                {
                  key: 'employmentType',
                  label: 'employmentType',
                  type: 'select',
                  options: [
                    { label: 'FULL_TIME', value: 'FULL_TIME' },
                    { label: 'PART_TIME', value: 'PART_TIME' },
                    { label: 'SELF_EMPLOYED', value: 'SELF_EMPLOYED' },
                    { label: 'UNEMPLOYED', value: 'UNEMPLOYED' }
                  ]
                },
                { key: 'loanAmount', label: 'loanAmount', placeholder: '25000' },
                {
                  key: 'loanPurpose',
                  label: 'loanPurpose',
                  type: 'select',
                  options: [
                    { label: 'HOME_LOAN', value: 'HOME_LOAN' },
                    { label: 'AUTO_LOAN', value: 'AUTO_LOAN' },
                    { label: 'PERSONAL', value: 'PERSONAL' },
                    { label: 'BUSINESS', value: 'BUSINESS' }
                  ]
                }
              ],
              defaultInput: {
                applicantId: 'APP-001',
                incomeAnnual: '75000',
                debtExisting: '15000',
                creditHistoryYears: '8',
                numCreditLines: '5',
                recentDelinquencies: '0',
                employmentType: 'FULL_TIME',
                loanAmount: '25000',
                loanPurpose: 'PERSONAL'
              },
              run: (http, form) =>
                http('POST', '/api/scoring/api/v1/score', {
                  applicant_id: form.applicantId,
                  income_annual: Number(form.incomeAnnual),
                  debt_existing: Number(form.debtExisting),
                  credit_history_length_years: Number(form.creditHistoryYears),
                  num_credit_lines: Number(form.numCreditLines),
                  recent_delinquencies: Number(form.recentDelinquencies),
                  employment_type: form.employmentType,
                  loan_amount: Number(form.loanAmount),
                  loan_purpose: form.loanPurpose
                })
            },
            {
              key: 'scoring-get',
              label: 'GET /api/v1/score/{applicant_id}',
              fields: [
                { key: 'applicantId', label: 'applicantId', placeholder: 'APP-001' }
              ],
              defaultInput: { applicantId: 'APP-001' },
              run: (http, form) => http('GET', `/api/scoring/api/v1/score/${encodeURIComponent(form.applicantId)}`)
            }
          ]}
        />

        <ApiCard
          title="document-processing (Node.js)"
          subtitle="Document upload and metadata extraction"
          actions={[
            {
              key: 'docs-health',
              label: 'GET /health',
              run: (http) => http('GET', '/api/docs/health')
            },
            {
              key: 'docs-list',
              label: 'GET /api/v1/documents',
              run: (http) => http('GET', '/api/docs/api/v1/documents')
            },
            {
              key: 'docs-upload',
              label: 'POST /api/v1/documents/upload',
              hint: 'File upload not supported in this simple UI; use curl to test.',
              run: () => ({ message: 'Use curl to upload files' })
            },
            {
              key: 'docs-reprocess',
              label: 'POST /documents/{id}/reprocess',
              fields: [
                { key: 'documentId', label: 'documentId', placeholder: 'DOC-001' }
              ],
              defaultInput: { documentId: 'DOC-001' },
              run: (http, form) => http('POST', `/api/docs/api/v1/documents/${encodeURIComponent(form.documentId)}/reprocess`)
            }
          ]}
        />
      </div>

      <div className="small" style={{ marginTop: 14 }}>
        Tip: run services locally on ports 8083/8084/8085, then run UI.
      </div>
    </div>
  )
}
