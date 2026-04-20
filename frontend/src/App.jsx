import { useState, useEffect, Component } from 'react'
import ReactMarkdown from 'react-markdown'
import { AnimatePresence, motion } from 'motion/react'
import {
  Building2, Newspaper, MessageSquare, AlertTriangle, Users, Mic,
  ChevronRight, ChevronLeft, ArrowLeft, Search, Copy, Check, TrendingUp,
  LayoutDashboard, BarChart3, Settings, Clock, Calendar, LayoutGrid, List,
} from 'lucide-react'
import { Landing } from './pages/Landing'
import { CrmSelect, CRM_CONFIG } from './pages/CrmSelect'
import { Card, CardHeader, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'

const API_BASE = 'http://localhost:3001'

// ─── Error boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#f87171', background: '#0a0a0f', minHeight: '100vh' }}>
          <h2 style={{ color: '#ef4444', marginBottom: 16 }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#6b7280', marginTop: 16 }}>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

const MD = {
  p:      ({ children }) => <p className="text-sm text-[#9ca3af] leading-relaxed mb-2.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="text-[#f4f4f8] font-semibold">{children}</strong>,
  em:     ({ children }) => <em className="text-[#9ca3af]">{children}</em>,
  ul:     ({ children }) => <ul className="my-2.5 pl-4 space-y-1.5 list-disc marker:text-[#6b6b7e]">{children}</ul>,
  ol:     ({ children }) => <ol className="my-2.5 pl-4 space-y-1.5 list-decimal marker:text-indigo-400 marker:font-semibold">{children}</ol>,
  li:     ({ children }) => <li className="text-sm text-[#9ca3af] leading-relaxed">{children}</li>,
  a:      ({ href, children }) => <a href={href} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">{children}</a>,
  h3:     ({ children }) => <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] mt-4 mb-2">{children}</h3>,
}

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

function riskVariant(level) {
  const map = { critical: 'red', high: 'red', medium: 'amber', low: 'green' }
  return map[level] ?? 'default'
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / 86_400_000)
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function getDateStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ─── Static data ──────────────────────────────────────────────────────────────

const LAST_ACTIVITY = {
  'Vantage Retail Co':   'No contact in 45 days — last ticket unresolved',
  'Meridian Logistics':  'Sandra flagged SLA breach — renewal in 17 days',
  'Pinnacle Legal Group':'Low seat utilization reported by Derek',
  'Crestwood Media':     'QBR completed — UX concerns noted',
  'Helix Biotech':       'Expansion discussion with Priya — EU module interest',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`rounded bg-[#1e1e2e] animate-pulse ${className}`} />
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e1e2e]">
        <Skeleton className="h-2.5 w-28" />
      </div>
      <div className="px-5 py-4 space-y-2.5">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-4/5" />
        <Skeleton className="h-2.5 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-2/3" />
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onBackToHome, activeView }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Building2,       label: 'Accounts',  id: 'accounts' },
    { icon: BarChart3,       label: 'Analytics', id: 'analytics', soon: true },
    { icon: Settings,        label: 'Settings',  id: 'settings',  soon: true },
  ]

  return (
    <aside className="w-60 shrink-0 border-r border-[#1e1e2e] flex flex-col h-screen sticky top-0 bg-[#0a0a0f]">
      {/* Logo */}
      <div className="px-4 py-[18px] border-b border-[#1e1e2e] flex items-center gap-2.5">
        <img src="/logo.png" alt="Wingman" className="h-7 w-7 rounded-md object-contain" />
        <span className="font-semibold text-[#f4f4f8] text-sm tracking-tight">Wingman</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b7e] px-2 mb-2">Menu</p>
        <div className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, id, soon }) => {
            const isActive = activeView === id || (activeView === 'briefing' && id === 'accounts')
            return (
              <div
                key={id}
                className={[
                  'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors duration-150 select-none',
                  isActive
                    ? 'bg-[#1e1e2e] text-white border-l-2 border-indigo-500 pl-[6px]'
                    : 'text-[#6b6b7e] hover:text-[#c4c4d0] cursor-default',
                  soon ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[#6b6b7e] bg-[#111118] border border-[#2a2a3e] rounded px-1.5 py-0.5">
                    Soon
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#1e1e2e] space-y-3">
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-lg p-3">
          <p className="text-xs text-[#6b6b7e]">Built by Priyank Bagad</p>
          <a
            href="https://priyankbagad.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            priyankbagad.com
          </a>
        </div>
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs text-[#6b6b7e] hover:text-[#f4f4f8] transition-colors duration-150 px-1"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to home
        </button>
      </div>
    </aside>
  )
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow({ accounts }) {
  const total        = accounts.length
  const atRisk       = accounts.filter(a => a.health_score <= 4).length
  const renewalsSoon = accounts.filter(a => { const d = daysUntil(a.renewal_date); return d >= 0 && d <= 30 }).length
  const healthy      = accounts.filter(a => a.health_score >= 8).length

  const stats = [
    { label: 'Total accounts',     value: total,        icon: Building2,   color: 'indigo' },
    { label: 'At risk accounts',   value: atRisk,       icon: AlertTriangle,color: 'red'   },
    { label: 'Renewing in 30 days',value: renewalsSoon, icon: Clock,        color: 'amber' },
    { label: 'Healthy accounts',   value: healthy,      icon: TrendingUp,   color: 'green' },
  ]

  const colors = {
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    red:    { text: 'text-red-400',    bg: 'bg-red-500/10'    },
    amber:  { text: 'text-amber-400',  bg: 'bg-amber-500/10'  },
    green:  { text: 'text-green-400',  bg: 'bg-green-500/10'  },
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {stats.map(({ label, value, icon: Icon, color }) => {
        const { text, bg } = colors[color]
        return (
          <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e]">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${text}`}>{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-5 w-5 ${text}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({ account: acc, onSelect, isActive, listView }) {
  const days        = daysUntil(acc.renewal_date)
  const variant     = healthVariant(acc.health_score)
  const borderColor = acc.health_score <= 4 ? '#ef4444' : acc.health_score <= 7 ? '#f59e0b' : '#22c55e'
  const lastActivity = acc.notes?.length > 0
    ? acc.notes[acc.notes.length - 1].content
    : LAST_ACTIVITY[acc.name] ?? 'No recent activity recorded'

  const daysPill = days < 0
    ? 'bg-red-950/50 border-red-900/50 text-red-400'
    : days <= 30
    ? 'bg-red-950/50 border-red-900/50 text-red-400'
    : days <= 90
    ? 'bg-amber-950/50 border-amber-900/50 text-amber-400'
    : 'bg-[#1e1e2e] border-[#2a2a3e] text-[#6b6b7e]'

  if (listView) {
    return (
      <button
        onClick={() => onSelect(acc.name)}
        className={`text-left w-full rounded-xl border border-[#1e1e2e] bg-[#111118] px-5 py-4 hover:border-indigo-500/50 transition-all duration-200 flex items-center gap-5 ${isActive ? 'ring-1 ring-indigo-500/70' : ''}`}
        style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{acc.name}</span>
            <span className="text-xs bg-[#1e1e2e] text-[#6b6b7e] rounded-full px-2 py-0.5">{acc.industry}</span>
          </div>
          <p className="text-xs text-[#6b6b7e] mt-1 truncate">{lastActivity}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-medium text-[#f4f4f8] hidden sm:block">${acc.contract_value?.toLocaleString()}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${daysPill}`}>
            {days < 0 ? 'Overdue' : `${days}d`}
          </span>
          <Badge variant={variant}>{acc.health_score}/10</Badge>
          <span className="text-xs text-indigo-400 hover:text-indigo-300">Generate →</span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => onSelect(acc.name)}
      className={`text-left w-full rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer focus:outline-none flex flex-col min-h-48 ${isActive ? 'ring-1 ring-indigo-500/70' : ''}`}
      style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white leading-snug">{acc.name}</p>
          <span className="inline-block text-xs bg-[#1e1e2e] text-[#6b6b7e] rounded-full px-2 py-0.5 mt-1">{acc.industry}</span>
        </div>
        <Badge variant={variant} className="shrink-0">{acc.health_score}/10</Badge>
      </div>

      {/* Middle */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
          <span className="text-sm font-medium text-white">${acc.contract_value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
          <span className="text-sm text-[#6b6b7e]">{fmt(acc.renewal_date)}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${daysPill}`}>
            {days < 0 ? 'Overdue' : `${days}d`}
          </span>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-3 pt-3 border-t border-[#1e1e2e] flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b7e] mb-1">Last Activity</p>
          <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">{lastActivity}</p>
        </div>
        <p className="text-xs text-indigo-400 mt-2 text-right">Generate brief →</p>
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query, onSelect, suggestions }) {
  const defaultSuggestions = suggestions ?? ['Meridian Logistics', 'Helix Biotech']
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <Search className="h-10 w-10 text-[#2a2a3e] mb-4" />
      <p className="text-[#6b6b7e] text-sm">
        No accounts found for "<span className="text-[#c4c4d0]">{query}</span>"
      </p>
      <p className="text-xs text-[#6b6b7e] mt-4 mb-2">Try:</p>
      <div className="flex gap-3 flex-wrap justify-center">
        {defaultSuggestions.map(s => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'at-risk',  label: 'At Risk' },
  { id: 'healthy',  label: 'Healthy' },
]

function DashboardPage({ accounts, onSelect, activeCompany, query, setQuery, onSubmit, loading, crmData, onSwitchCrm }) {
  const [filter, setFilter]     = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  const filteredAccounts = accounts.filter(acc => {
    const nameMatch = !query.trim() || acc.name.toLowerCase().includes(query.toLowerCase())
    let healthMatch = true
    if (filter === 'critical') healthMatch = acc.health_score <= 3
    else if (filter === 'at-risk') healthMatch = acc.health_score >= 4 && acc.health_score <= 6
    else if (filter === 'healthy') healthMatch = acc.health_score >= 7
    return nameMatch && healthMatch
  })

  const atRiskCount  = accounts.filter(a => a.health_score <= 6).length
  const crmCfg       = crmData ? CRM_CONFIG[crmData.crm] : null
  const suggestions  = crmData ? crmData.accounts.slice(0, 2).map(a => a.name) : null

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="border-b border-[#1e1e2e] px-8 py-4 flex items-center gap-3 bg-[#0a0a0f] sticky top-0 z-10">
        <form onSubmit={onSubmit} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b7e] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search accounts or enter any company name…"
              disabled={loading}
              className="w-full h-10 pl-9 pr-4 bg-[#111118] border border-[#1e1e2e] rounded-lg text-sm text-[#f4f4f8] placeholder-[#6b6b7e] outline-none focus:border-indigo-500/70 transition-colors disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Generate Briefing
          </button>
        </form>

        {/* CRM badge */}
        {crmCfg && (
          <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-[#1e1e2e]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: crmCfg.color }} />
              <span className="text-sm font-medium text-[#f4f4f8]">{crmCfg.label}</span>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Connected
              </span>
            </div>
            <button
              onClick={onSwitchCrm}
              className="text-xs text-[#6b6b7e] hover:text-[#f4f4f8] transition-colors border border-[#1e1e2e] hover:border-[#2a2a3e] rounded px-2 py-1"
            >
              Switch CRM
            </button>
          </div>
        )}
      </div>

      {/* Page content */}
      <div className="px-8 py-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">{getGreeting()}</h1>
          <p className="text-sm text-[#6b6b7e] mt-1">
            {getDateStr()} · {accounts.length} accounts · {atRiskCount} need attention
          </p>
        </div>

        {/* Stats */}
        {accounts.length > 0 && <StatsRow accounts={accounts} />}

        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">All Accounts</h2>
            <span className="text-xs text-[#6b6b7e] bg-[#111118] border border-[#1e1e2e] rounded-full px-2 py-0.5">
              {accounts.length}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#111118] border border-[#1e1e2e] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#1e1e2e] text-white' : 'text-[#6b6b7e] hover:text-white'}`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#1e1e2e] text-white' : 'text-[#6b6b7e] hover:text-white'}`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                filter === id
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-transparent border-[#1e1e2e] text-[#6b6b7e] hover:text-white hover:border-[#2a2a3e]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Accounts */}
        {filteredAccounts.length === 0 && query.trim() ? (
          <EmptyState query={query} onSelect={onSelect} suggestions={suggestions} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAccounts.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                onSelect={onSelect}
                isActive={activeCompany === acc.name}
                listView={false}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAccounts.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                onSelect={onSelect}
                isActive={activeCompany === acc.name}
                listView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Briefing cards (left column) ────────────────────────────────────────────

function AccountOverviewCard({ account, overviewContent }) {
  const days    = daysUntil(account.renewal_date)
  const variant = healthVariant(account.health_score)

  return (
    <Card>
      <CardHeader>
        <Building2 className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] flex-1">Account Overview</span>
        <Badge variant={variant}>Health {account.health_score}/10</Badge>
        <Badge variant={days < 0 ? 'red' : days <= 30 ? 'amber' : 'default'}>
          {days < 0 ? 'Renewal overdue' : `${days}d to renewal`}
        </Badge>
      </CardHeader>

      <div className="grid grid-cols-3 border-b border-[#1e1e2e]">
        {[
          { label: 'Industry',     value: account.industry },
          { label: 'Annual Value', value: `$${account.contract_value?.toLocaleString()}` },
          { label: 'Renewal Date', value: fmt(account.renewal_date) },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-4 border-r border-[#1e1e2e] last:border-r-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] mb-1">{label}</p>
            <p className="text-sm font-semibold text-[#f4f4f8]">{value}</p>
          </div>
        ))}
      </div>

      {overviewContent && (
        <CardContent>
          <ReactMarkdown components={MD}>{overviewContent}</ReactMarkdown>
        </CardContent>
      )}
    </Card>
  )
}

function NewsPulseCard({ news }) {
  return (
    <Card>
      <CardHeader>
        <Newspaper className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] flex-1">News Pulse</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-green-900/50 bg-green-950/30 text-[10px] font-semibold text-green-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          Live
        </span>
      </CardHeader>
      <div className="divide-y divide-[#1e1e2e]">
        {news.map((item, i) => (
          <div key={i} className="px-5 py-4">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[#f4f4f8] hover:text-indigo-400 transition-colors leading-snug block mb-1"
            >
              {item.title}
            </a>
            {item.snippet && <p className="text-xs text-[#6b6b7e] leading-relaxed mb-1">{item.snippet}</p>}
            {item.date    && <span className="text-[10px] text-[#4b5563]">{item.date}</span>}
          </div>
        ))}
      </div>
    </Card>
  )
}

function TalkingPointsCard({ content }) {
  return (
    <Card>
      <CardHeader>
        <MessageSquare className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e]">Recommended Talking Points</span>
      </CardHeader>
      <CardContent>
        <ReactMarkdown components={MD}>{content}</ReactMarkdown>
      </CardContent>
    </Card>
  )
}

function RiskSignalsCard({ content }) {
  return (
    <Card className="border-l-2 border-l-amber-500/70">
      <CardHeader>
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e]">Risk Signals</span>
      </CardHeader>
      <CardContent>
        <ReactMarkdown components={MD}>{content}</ReactMarkdown>
      </CardContent>
    </Card>
  )
}

// ─── Sidebar cards (right column) ────────────────────────────────────────────

function RiskScoreCard({ risk }) {
  const variant     = riskVariant(risk.level)
  const scoreColor  = variant === 'red' ? 'text-red-400'    : variant === 'amber' ? 'text-amber-400'    : 'text-green-400'
  const dotColor    = variant === 'red' ? 'bg-red-400'      : variant === 'amber' ? 'bg-amber-400'      : 'bg-green-400'
  const leftBorder  = variant === 'red' ? 'border-l-red-500/70' : variant === 'amber' ? 'border-l-amber-500/70' : 'border-l-green-500/70'

  return (
    <Card className={`border-l-2 ${leftBorder}`}>
      <CardHeader>
        <TrendingUp className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] flex-1">Risk Analysis</span>
        <Badge variant={variant}>{risk.level}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 mb-4">
          <span className={`text-6xl font-bold leading-none ${scoreColor}`}>{risk.score}</span>
          <span className="text-[#6b6b7e] text-sm mb-1">/10</span>
        </div>
        <hr className="border-[#1e1e2e] mb-4" />
        {risk.reasons?.length > 0 && (
          <ul className="space-y-2 mb-4">
            {risk.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dotColor}`} />
                {r}
              </li>
            ))}
          </ul>
        )}
        {risk.recommendation && (
          <p className="text-sm text-[#6b6b7e] italic leading-relaxed border-t border-[#1e1e2e] pt-3">
            {risk.recommendation}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ContactsCard({ contacts }) {
  return (
    <Card>
      <CardHeader>
        <Users className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] flex-1">Key Contacts</span>
        <span className="text-xs text-[#6b6b7e]">{contacts.length}</span>
      </CardHeader>
      <div className="divide-y divide-[#1e1e2e]">
        {contacts.map(c => (
          <div key={c.email} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-900/50 flex items-center justify-center text-xs font-semibold text-indigo-400 shrink-0 select-none">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f4f4f8] truncate">{c.name}</p>
              <p className="text-xs text-[#6b6b7e] truncate">{c.role}</p>
              <a href={`mailto:${c.email}`} className="text-xs text-indigo-400 hover:text-indigo-300 truncate block transition-colors">
                {c.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function TalkLine({ num, text }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="group flex items-start gap-3 px-5 py-4 hover:bg-[#15151e] transition-colors">
      <span className="text-indigo-400 font-semibold text-sm shrink-0 mt-0.5 select-none">{num}</span>
      <p className="flex-1 text-sm text-[#e2e2e8] italic leading-relaxed">"{text}"</p>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded text-[#6b6b7e] hover:text-[#f4f4f8] hover:bg-[#1e1e2e]"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

function TalkTrackCard({ lines }) {
  return (
    <Card>
      <CardHeader>
        <Mic className="h-3.5 w-3.5 text-[#6b6b7e] shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b6b7e] flex-1">Talk Track</span>
        <span className="text-[10px] text-[#6b6b7e]">Pick one</span>
      </CardHeader>
      <div className="divide-y divide-[#1e1e2e]">
        {lines.map((line, i) => (
          <TalkLine key={i} num={i + 1} text={line} />
        ))}
      </div>
    </Card>
  )
}

// ─── Briefing page ────────────────────────────────────────────────────────────

function BriefingPage({ result, loading, error, onBack, activeCompany }) {
  const sections = result ? parseSections(result.briefing) : {}

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b6b7e] hover:text-[#f4f4f8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-[#6b6b7e]" />
        <span className="text-xs text-[#6b6b7e]">Accounts</span>
        <ChevronRight className="h-3.5 w-3.5 text-[#6b6b7e]" />
        <span className="text-xs text-[#f4f4f8] font-medium">{activeCompany}</span>
      </div>

      {/* Loading */}
      {loading && (
        <>
          <p className="text-sm text-[#6b6b7e] mb-6">Generating your briefing…</p>
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="xl:w-[340px] shrink-0 space-y-4">
              <SkeletonCard /><SkeletonCard />
            </div>
          </div>
        </>
      )}

      {/* Error */}
      {error && !loading && <p className="text-sm text-[#6b6b7e]">{error}</p>}

      {/* Two-column layout */}
      {result && !loading && (
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <AccountOverviewCard account={result.account} overviewContent={sections['Account Overview']} />
            {result.news?.length > 0 && <NewsPulseCard news={result.news} />}
            {sections['Recommended Talking Points'] && <TalkingPointsCard content={sections['Recommended Talking Points']} />}
            {sections['Risk Signals']               && <RiskSignalsCard   content={sections['Risk Signals']} />}
          </div>
          <aside className="xl:w-[340px] shrink-0 space-y-4 xl:sticky xl:top-8 xl:self-start xl:max-h-[calc(100vh-64px)] xl:overflow-y-auto">
            {result.risk_analysis               && <RiskScoreCard risk={result.risk_analysis} />}
            <ContactsCard contacts={result.contacts} />
            {result.talk_track?.length > 0      && <TalkTrackCard lines={result.talk_track} />}
          </aside>
        </div>
      )}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [showLanding,   setShowLanding]   = useState(true)
  const [selectedCrm,   setSelectedCrm]   = useState(null)
  const [crmData,       setCrmData]       = useState(null)
  const [query,         setQuery]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [result,        setResult]        = useState(null)
  const [accounts,      setAccounts]      = useState([])
  const [activeCompany, setActiveCompany] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/accounts`)
      .then(r => r.json())
      .then(d => setAccounts(d.accounts ?? []))
      .catch(() => {})
  }, [])

  async function handleCrmSelect(crmId) {
    try {
      const res  = await fetch(`${API_BASE}/api/crm/accounts/${crmId}`)
      const data = await res.json()
      setSelectedCrm(crmId)
      setCrmData(data)
    } catch {
      // If backend is unreachable, proceed with selected CRM but no data
      setSelectedCrm(crmId)
    }
  }

  function handleSwitchCrm() {
    setSelectedCrm(null)
    setCrmData(null)
    setResult(null)
    setError(null)
    setActiveCompany(null)
    setQuery('')
  }

  async function generate(company, crmAccount = null) {
    if (!company.trim()) return
    setQuery(company)
    setActiveCompany(company)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res  = await fetch(`${API_BASE}/api/brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: company.trim(), crmAccount }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Something went wrong.')
      else         setResult(data)
    } catch {
      setError('Cannot reach the Wingman backend. Make sure it is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(companyName) {
    const crmAccount = crmData?.accounts?.find(a => a.name === companyName) ?? null
    generate(companyName, crmAccount)
  }

  function handleBack() {
    setResult(null)
    setActiveCompany(null)
    setError(null)
  }

  const displayAccounts  = crmData?.accounts ?? accounts
  const showBriefingView = result !== null || loading || error !== null
  const activeView       = showBriefingView ? 'accounts' : 'dashboard'

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Landing onGetStarted={() => setShowLanding(false)} />
          </motion.div>
        ) : selectedCrm === null ? (
          <motion.div key="crm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <CrmSelect
              onCrmSelect={handleCrmSelect}
              onBack={() => setShowLanding(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-screen bg-[#0a0a0f] overflow-hidden"
          >
            <Sidebar onBackToHome={() => setShowLanding(true)} activeView={activeView} />

            <main className="flex-1 overflow-y-auto">
              {showBriefingView ? (
                <BriefingPage
                  result={result}
                  loading={loading}
                  error={error}
                  onBack={handleBack}
                  activeCompany={activeCompany}
                />
              ) : (
                <DashboardPage
                  accounts={displayAccounts}
                  onSelect={handleSelect}
                  activeCompany={activeCompany}
                  query={query}
                  setQuery={setQuery}
                  onSubmit={e => { e.preventDefault(); handleSelect(query) }}
                  loading={loading}
                  crmData={crmData}
                  onSwitchCrm={handleSwitchCrm}
                />
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  )
}
