import React from 'react'

import { http } from '../api'

function pretty(v) {
  return typeof v === 'string' ? v : JSON.stringify(v, null, 2)
}

export default function ApiCard({ title, subtitle, actions }) {
  const [output, setOutput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const run = async (fn) => {
    try {
      setError(null)
      setLoading(true)
      const res = await fn(http)
      setOutput(pretty(res))
    } catch (e) {
      setOutput(pretty(e.payload ?? String(e)))
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <h2>{title}</h2>
          {subtitle ? <div className="small">{subtitle}</div> : null}
        </div>
        <div className="status">
          <span className={`dot ${error ? 'bad' : output ? 'ok' : ''}`} />
          <span>{loading ? 'Running…' : error ? 'Error' : output ? 'OK' : 'Idle'}</span>
        </div>
      </div>

      <hr />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.map((a) => (
          <ActionRow key={a.key} action={a} run={run} disabled={loading} />
        ))}
      </div>

      <hr />

      <pre>{output || 'Click an action to call an API endpoint…'}</pre>
    </div>
  )
}

function ActionRow({ action, run, disabled }) {
  const [form, setForm] = React.useState(action.defaultInput ?? {})

  const onChange = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  return (
    <div>
      <div className="row">
        {action.fields?.map((f) => (
          <div key={f.key} className="field">
            <label>{f.label}</label>
            {f.type === 'select' ? (
              <select value={form[f.key] ?? ''} onChange={(e) => onChange(f.key, e.target.value)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form[f.key] ?? ''}
                placeholder={f.placeholder ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          className={action.danger ? 'danger' : ''}
          disabled={disabled}
          onClick={() => run((http) => action.run(http, form))}
        >
          {action.label}
        </button>
      </div>
      {action.hint ? <div className="small" style={{ marginTop: 6 }}>{action.hint}</div> : null}
    </div>
  )
}
