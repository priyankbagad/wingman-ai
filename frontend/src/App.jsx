import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

const API_URL = 'http://localhost:3001/api/brief'

const DEMO_ACCOUNTS = ['Meridian Logistics', 'Helix Biotech', 'Crestwood Media']

// Extract ## sections from Claude's markdown briefing
function parseSections(briefing) {
  const sections = {}
  const regex = /^## (.+)$/gm
  const matches = [...briefing.matchAll(regex)]
  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim()
    const start = matches[i].index + matches[i][0].length
    const end = matches[i + 1]?.index ?? briefing.length
    sections[heading] = briefing.slice(start, end).trim()
  }
  return sections
}

function healthVariant(score) {
  if (score <= 4) return 'red'
  if (score <= 7) return 'amber'
  return 'green'
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86_400_000)
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AccountCard({ account, overviewContent }) {
  const days = daysUntil(account.renewal_date)
  const variant = healthVariant(account.health_score)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Account Overview</h2>
        <div className="badges">
          <span className={`badge badge-${variant}`}>
            Health {account.health_score}/10
          </span>
          {days < 0 ? (
            <span className="badge badge-red">Renewal overdue</span>
          ) : (
            <span className={`badge ${days <= 30 ? 'badge-red' : 'badge-neutral'}`}>
              {days}d to renewal
            </span>
          )}
        </div>
      </div>

      <div className="meta-row">
        <div className="meta-cell">
          <span className="meta-label">Industry</span>
          <span className="meta-value">{account.industry}</span>
        </div>
        <div className="meta-cell">
          <span className="meta-label">Annual Value</span>
          <span className="meta-value">${account.contract_value?.toLocaleString()}</span>
        </div>
        <div className="meta-cell">
          <span className="meta-label">Renewal Date</span>
          <span className="meta-value">{fmt(account.renewal_date)}</span>
        </div>
      </div>

      {overviewContent && (
        <div className="card-body markdown">
          <ReactMarkdown>{overviewContent}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

function ContactsCard({ contacts }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Key Contacts</h2>
        <span className="pill">{contacts.length}</span>
      </div>
      <div className="contacts-grid">
        {contacts.map((c) => (
          <div key={c.email} className="contact">
            <div className="contact-avatar">{c.name.charAt(0)}</div>
            <div className="contact-body">
              <div className="contact-name">{c.name}</div>
              <div className="contact-role">{c.role}</div>
              <a href={`mailto:${c.email}`} className="contact-email">{c.email}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskCard({ content }) {
  return (
    <div className="card card-risk">
      <div className="card-header">
        <h2 className="card-title risk-title">
          <span className="risk-icon">⚠</span>
          Risk Signals
        </h2>
      </div>
      <div className="card-body markdown">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

function TalkingPointsCard({ content }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recommended Talking Points</h2>
      </div>
      <div className="card-body markdown">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  async function generate(company) {
    if (!company.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Cannot reach the Wingman backend. Make sure it is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    generate(query)
  }

  function fillDemo(name) {
    setQuery(name)
    inputRef.current?.focus()
  }

  const sections = result ? parseSections(result.briefing) : {}

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">W</span>
            <span className="logo-name">Wingman</span>
          </div>
          <span className="divider" />
          <p className="tagline">Your AI co-pilot before every sales call</p>
        </div>
      </header>

      <main className="main">
        {/* Search */}
        <section className="search-section">
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a company name…"
              disabled={loading}
              autoFocus
            />
            <button
              className="search-btn"
              type="submit"
              disabled={loading || !query.trim()}
            >
              {loading ? 'Generating…' : 'Generate Briefing'}
            </button>
          </form>
          <p className="search-hint">
            Try:{' '}
            {DEMO_ACCOUNTS.map((name, i) => (
              <span key={name}>
                <button className="demo-btn" type="button" onClick={() => fillDemo(name)}>
                  {name}
                </button>
                {i < DEMO_ACCOUNTS.length - 1 && <span className="sep">, </span>}
              </span>
            ))}
          </p>
        </section>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Wingman is preparing your briefing…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-box">
            <span className="error-icon">✕</span>
            <div>
              <p className="error-msg">{error}</p>
            </div>
          </div>
        )}

        {/* Briefing */}
        {result && !loading && (
          <div className="briefing">
            <AccountCard
              account={result.account}
              overviewContent={sections['Account Overview']}
            />
            <ContactsCard contacts={result.contacts} />
            {sections['Risk Signals'] && (
              <RiskCard content={sections['Risk Signals']} />
            )}
            {sections['Recommended Talking Points'] && (
              <TalkingPointsCard content={sections['Recommended Talking Points']} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
