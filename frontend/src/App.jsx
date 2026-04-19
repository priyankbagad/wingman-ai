import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

const API_BASE = 'http://localhost:3001'

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function riskLevelVariant(level) {
  const map = { critical: 'red', high: 'amber', medium: 'yellow', low: 'green' }
  return map[level] ?? 'neutral'
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86_400_000)
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ─── Dashboard: account grid ──────────────────────────────────────────────────

function AccountGrid({ accounts, onSelect, activeCompany }) {
  return (
    <section className="dashboard">
      <div className="section-heading-row">
        <h2 className="section-heading">All Accounts</h2>
        <span className="section-sub">Click any account to generate a briefing</span>
      </div>
      <div className="accounts-grid">
        {accounts.map((acc) => {
          const days = daysUntil(acc.renewal_date)
          const variant = healthVariant(acc.health_score)
          const isActive = activeCompany === acc.name
          return (
            <button
              key={acc.id}
              className={`acct-card acct-card--${variant}${isActive ? ' acct-card--active' : ''}`}
              onClick={() => onSelect(acc.name)}
            >
              <div className="acct-card-top">
                <span className="acct-name">{acc.name}</span>
                <span className={`badge badge-${variant}`}>{acc.health_score}/10</span>
              </div>
              <span className="acct-industry">{acc.industry}</span>
              <div className="acct-card-footer">
                <span className="acct-acv">${acc.contract_value?.toLocaleString()}</span>
                {days < 0 ? (
                  <span className="badge badge-red">Overdue</span>
                ) : (
                  <span className={`badge ${days <= 30 ? 'badge-red' : 'badge-neutral'}`}>
                    {days}d to renewal
                  </span>
                )}
              </div>
              <div className={`acct-bar acct-bar--${variant}`} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ─── Risk analysis card (Feature 2) ──────────────────────────────────────────

function RiskAnalysisCard({ risk }) {
  const variant = riskLevelVariant(risk.level)
  return (
    <div className={`card card-ra card-ra--${variant}`}>
      <div className="card-header">
        <div className="ra-header-left">
          <h2 className="card-title ra-title">Risk Analysis</h2>
          <span className={`ra-level-badge ra-level--${variant}`}>
            {risk.level?.toUpperCase()}
          </span>
        </div>
        <span className={`ra-score ra-score--${variant}`}>{risk.score}<span className="ra-score-denom">/10</span></span>
      </div>
      <div className="card-body">
        {risk.reasons?.length > 0 && (
          <ul className="ra-reasons">
            {risk.reasons.map((r, i) => (
              <li key={i} className="ra-reason">{r}</li>
            ))}
          </ul>
        )}
        {risk.recommendation && (
          <div className={`ra-recommendation ra-rec--${variant}`}>
            <span className="ra-rec-label">Rep recommendation</span>
            <p className="ra-rec-text">{risk.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Account overview card ────────────────────────────────────────────────────

function AccountCard({ account, overviewContent }) {
  const days = daysUntil(account.renewal_date)
  const variant = healthVariant(account.health_score)
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Account Overview</h2>
        <div className="badges">
          <span className={`badge badge-${variant}`}>Health {account.health_score}/10</span>
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

// ─── Contacts card ────────────────────────────────────────────────────────────

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

// ─── News pulse card (Feature 3) ─────────────────────────────────────────────

function NewsPulseCard({ news }) {
  if (!news?.length) return null
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">News Pulse</h2>
        <span className="live-badge">
          <span className="live-dot" />
          LIVE
        </span>
      </div>
      <div className="news-list">
        {news.map((item, i) => (
          <div key={i} className="news-item">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="news-title"
            >
              {item.title}
            </a>
            {item.snippet && <p className="news-snippet">{item.snippet}</p>}
            {item.date && <span className="news-date">{item.date}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Talk track card (Feature 4) ─────────────────────────────────────────────

function TalkTrackCard({ lines }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  function copy(text, idx) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1800)
    })
  }

  if (!lines?.length) return null
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Talk Track</h2>
        <span className="pill">Pick one</span>
      </div>
      <div className="talk-tracks">
        {lines.map((line, i) => (
          <div key={i} className="talk-track">
            <span className="track-num">{i + 1}</span>
            <p className="track-text">"{line}"</p>
            <button
              className={`copy-btn${copiedIdx === i ? ' copy-btn--done' : ''}`}
              onClick={() => copy(line, i)}
              title="Copy to clipboard"
            >
              {copiedIdx === i ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Risk signals & talking points (existing, from briefing markdown) ─────────

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
  const [accounts, setAccounts] = useState([])
  const [activeCompany, setActiveCompany] = useState(null)
  const inputRef = useRef(null)

  // Load accounts dashboard on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/accounts`)
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []))
      .catch(() => {})
  }, [])

  async function generate(company) {
    if (!company.trim()) return
    setQuery(company)
    setActiveCompany(company)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setActiveCompany(null)
      } else {
        setResult(data)
      }
    } catch {
      setError('Cannot reach the Wingman backend. Make sure it is running on port 3001.')
      setActiveCompany(null)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    generate(query)
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
            />
            <button
              className="search-btn"
              type="submit"
              disabled={loading || !query.trim()}
            >
              {loading ? 'Generating…' : 'Generate Briefing'}
            </button>
          </form>
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
            <p className="error-msg">{error}</p>
          </div>
        )}

        {/* Briefing */}
        {result && !loading && (
          <div className="briefing">
            {result.risk_analysis && (
              <RiskAnalysisCard risk={result.risk_analysis} />
            )}
            <AccountCard
              account={result.account}
              overviewContent={sections['Account Overview']}
            />
            <ContactsCard contacts={result.contacts} />
            {result.news?.length > 0 && (
              <NewsPulseCard news={result.news} />
            )}
            {result.talk_track?.length > 0 && (
              <TalkTrackCard lines={result.talk_track} />
            )}
            {sections['Recommended Talking Points'] && (
              <TalkingPointsCard content={sections['Recommended Talking Points']} />
            )}
            {sections['Risk Signals'] && (
              <RiskCard content={sections['Risk Signals']} />
            )}
          </div>
        )}

        {/* Dashboard — shown when no briefing is loaded */}
        {!result && !loading && accounts.length > 0 && (
          <AccountGrid
            accounts={accounts}
            onSelect={generate}
            activeCompany={activeCompany}
          />
        )}
      </main>
    </div>
  )
}
