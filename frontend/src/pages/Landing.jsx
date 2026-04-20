import { motion } from 'motion/react'
import { LampContainer } from '../ui/lamp'
import { HoverBorderGradient } from '../ui/hover-border-gradient'
import {
  FileText, AlertTriangle, Newspaper, Mic, Search, Database,
  Zap, ExternalLink,
} from 'lucide-react'
import { CardSpotlight, Step } from '../ui/card-spotlight'

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: FileText,
    title: 'Instant AI briefing',
    description:
      'Structured brief covering account health, contacts, history and open issues — generated in seconds.',
  },
  {
    icon: AlertTriangle,
    title: 'Risk scoring',
    description:
      'AI scores every account 1–10 and surfaces exact reasons — SLA breaches, silence patterns, competitor signals.',
  },
  {
    icon: Newspaper,
    title: 'Live news pulse',
    description:
      'Real-time news about your account pulled before every meeting so you never walk in blind.',
  },
  {
    icon: Mic,
    title: 'Verbatim talk tracks',
    description:
      "3 specific opening lines tailored to this account's exact situation — ready to say word for word.",
  },
  {
    icon: Search,
    title: 'Semantic CRM search',
    description:
      "Vector search across all notes finds relevant context even when exact keywords don't match.",
  },
  {
    icon: Database,
    title: 'CRM agnostic',
    description:
      'Salesforce, HubSpot, Pipedrive or your own data — Wingman connects to where your data already lives.',
  },
]


const STEPS = [
  {
    number: '01',
    icon: Database,
    title: 'Connect your data',
    description: 'Point Wingman at your CRM or any data source.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Type a company name',
    description: 'Wingman retrieves everything relevant about that account.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Get your briefing',
    description: 'Full AI briefing with risk score, contacts, news and talk tracks.',
  },
]

const RISK_REASONS = [
  'Unresolved API latency bug — SLA breach for 2 consecutive months',
  'Active competitor evaluation detected (ShipHero)',
  'No response to last 3 outreach attempts — 14 days silent',
]


// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase">
      {children}
    </p>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-indigo-500/40 transition-colors duration-200 cursor-default">
      <Icon className="text-indigo-400 w-5 h-5 mb-4" />
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#6b6b7e] text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, icon: Icon, title, description }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 text-center flex-1">
      <div className="text-5xl font-bold text-indigo-900/60 mb-4 select-none leading-none">
        {number}
      </div>
      <Icon className="text-indigo-400 w-8 h-8 mx-auto mb-3" />
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#6b6b7e] text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function TechCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
      <Icon className="text-indigo-400 w-5 h-5 mb-4" />
      <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#6b6b7e] text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function LandingNav({ onGetStarted }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Wingman" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-semibold text-white text-lg tracking-tight">Wingman</span>
        </div>

        {/* Center links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features',     href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Demo',         href: '#demo' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-[#6b6b7e] hover:text-white transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="bg-[#6366f1] hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors duration-150 whitespace-nowrap"
        >
          Try Demo →
        </button>
      </div>
    </nav>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export function Landing({ onGetStarted }) {
  return (
    <div className="bg-[#0a0a0f]">
      <LandingNav onGetStarted={onGetStarted} />

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="scroll-mt-20">
        <LampContainer>
          <motion.div
            initial={{ opacity: 0.5, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center w-full gap-6 pt-16"
          >
            {/* Headline */}
            <h1 className="bg-gradient-to-br from-white to-indigo-300 py-4 bg-clip-text text-center text-6xl md:text-7xl font-semibold tracking-tight text-transparent leading-tight max-w-4xl">
              Your AI co-pilot
              <br />
              before every sales call
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-slate-400 max-w-2xl mt-4 leading-relaxed">
              Wingman reads your CRM, scans live news, scores account risk,
              and generates a full pre-meeting briefing — in seconds, not hours.
            </p>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-3 mt-8">
              <HoverBorderGradient
                as="button"
                onClick={onGetStarted}
                containerClassName="rounded-full"
                className="bg-slate-950 text-white text-base font-medium"
              >
                Try Demo →
              </HoverBorderGradient>
              <a
                href="#how-it-works"
                className="px-8 py-3 rounded-full border border-[#1e1e2e] text-sm font-medium text-[#6b6b7e] hover:text-white hover:border-[#2a2a3e] transition-colors duration-150"
              >
                How it works ↓
              </a>
            </div>

            {/* Fine print */}
            <p className="text-sm text-slate-600 mt-4">
              No signup required · See a real AI briefing in seconds
            </p>
          </motion.div>
        </LampContainer>
      </section>

      {/* ── 3. Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-3xl font-semibold text-white mt-2">
            Everything you need before the call
          </h2>
          <p className="text-[#6b6b7e] mt-2 mb-12">
            Wingman pulls from every signal so you walk in prepared.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">Instant AI briefing</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="Account health and contract value" />
                  <Step title="Recent interaction history" />
                  <Step title="Open issues and escalations" />
                  <Step title="Generated in seconds not hours" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Full account brief ready before every call.</p>
            </CardSpotlight>

            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">Risk scoring</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="AI score 1-10 per account" />
                  <Step title="SLA breach detection" />
                  <Step title="Competitor signal monitoring" />
                  <Step title="Silence pattern alerts" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Know which accounts need urgent attention.</p>
            </CardSpotlight>

            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">Live news pulse</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="Real-time Google News search" />
                  <Step title="Company-specific filtering" />
                  <Step title="Pulled fresh before every meeting" />
                  <Step title="Included in briefing context" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Never walk into a meeting blind again.</p>
            </CardSpotlight>

            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">Verbatim talk tracks</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="3 opening lines per account" />
                  <Step title="Tailored to exact situation" />
                  <Step title="One-click copy to clipboard" />
                  <Step title="Account-specific not generic" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Say exactly the right thing every time.</p>
            </CardSpotlight>

            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">Semantic CRM search</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="Semantic similarity search" />
                  <Step title="Finds context without exact keywords" />
                  <Step title="Searches all account notes" />
                  <Step title="Smart retrieval across history" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Surfaces relevant history you would have missed.</p>
            </CardSpotlight>

            <CardSpotlight className="h-72">
              <p className="text-lg font-bold relative z-20 mt-2 text-white">CRM agnostic</p>
              <div className="text-neutral-200 mt-4 relative z-20">
                <ul className="list-none mt-2 space-y-2">
                  <Step title="Works with Salesforce" />
                  <Step title="Works with HubSpot" />
                  <Step title="Works with Pipedrive" />
                  <Step title="Works with any data source" />
                </ul>
              </div>
              <p className="text-neutral-400 mt-4 relative z-20 text-sm">Connects to where your data already lives.</p>
            </CardSpotlight>
          </div>
        </div>
      </section>

      {/* ── 4. How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-24 bg-[#080808] border-y border-[#1e1e2e]">
        <div className="max-w-5xl mx-auto px-8">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-3xl font-semibold text-white mt-2 mb-16">
            From zero to briefed in 10 seconds
          </h2>

          <div className="relative">
            {/* Dashed connector — desktop only */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 border-t-2 border-dashed border-indigo-900/40 pointer-events-none" />
            <div className="flex flex-col md:flex-row gap-6">
              {STEPS.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Live demo preview ────────────────────────────────────────────── */}
      <section id="demo" className="scroll-mt-20 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <SectionLabel>Live Demo</SectionLabel>
          <h2 className="text-3xl font-semibold text-white mt-2">
            See a real Wingman briefing
          </h2>
          <p className="text-[#6b6b7e] mt-2 mb-10">
            Generated for an at-risk account with renewal in 18 days.
          </p>

          {/* Mockup card */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 w-full">
            {/* Header row */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <h3 className="text-xl font-semibold text-white">Meridian Logistics</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded border border-red-900/60 bg-red-950/60 text-xs font-semibold text-red-400">
                  Health 3/10
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded border border-red-900/60 bg-red-950/60 text-xs font-semibold text-red-400">
                  18d to renewal
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded border border-red-900/60 bg-red-950/60 text-xs font-semibold uppercase tracking-wider text-red-400">
                  Critical
                </span>
              </div>
            </div>

            <hr className="border-[#1e1e2e] my-6" />

            {/* Risk signals */}
            <div>
              <p className="text-xs uppercase tracking-widest text-red-400 mb-3">Risk Signals</p>
              <div className="bg-[#1a0f0f] border border-red-900/30 rounded-lg p-4 space-y-2.5">
                {RISK_REASONS.map((r) => (
                  <div key={r} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="text-sm text-slate-300">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Talk track */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Talk Track</p>
              <div className="bg-[#0d0d1a] border-l-4 border-indigo-500 rounded-r-lg p-4">
                <p className="italic text-slate-300 text-sm leading-relaxed">
                  "Sandra, I want to address the API issue directly before we
                  talk renewal — here is what our engineering team is committing to."
                </p>
              </div>
            </div>

            {/* Card footer */}
            <div className="mt-6 pt-4 border-t border-[#1e1e2e]">
              <p className="text-xs text-slate-600">
                Generated in 4.2s · AI-powered briefing
              </p>
            </div>
          </div>

          {/* CTA below mockup */}
          <div className="flex flex-col items-center mt-10 gap-3">
            <HoverBorderGradient
              as="button"
              onClick={onGetStarted}
              containerClassName="rounded-full"
              className="bg-slate-950 text-white text-base font-medium"
            >
              Try it yourself →
            </HoverBorderGradient>
            <p className="text-sm text-slate-600">No signup required · Free to try</p>
          </div>
        </div>
      </section>

      {/* ── 6. Final CTA ────────────────────────────────────────────────────── */}
      <section id="cta" className="scroll-mt-20 py-24 bg-[#0d0d1a] border-y border-[#1e1e2e]">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-semibold text-white">
            Walk into every call prepared.
          </h2>
          <p className="text-[#6b6b7e] text-lg mt-3 mb-8">
            Try a live Wingman briefing right now — no signup, no setup.
          </p>
          <div className="flex justify-center">
            <HoverBorderGradient
              as="button"
              onClick={onGetStarted}
              containerClassName="rounded-full"
              className="bg-slate-950 text-white text-lg font-medium"
            >
              Try Demo →
            </HoverBorderGradient>
          </div>
          <p className="text-sm text-slate-600 mt-4">
            No signup required · Free to try
          </p>
        </div>
      </section>

      {/* ── 8. Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0f] border-t border-[#1e1e2e] py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col gap-10 md:grid md:grid-cols-2">
            {/* Left — brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Wingman" className="h-7 w-7 rounded-lg object-contain" />
                <span className="font-semibold text-white text-sm">Wingman</span>
              </div>
              <p className="text-sm text-[#6b6b7e] mt-3 leading-relaxed">
                Your AI co-pilot before every sales call
              </p>
              <p className="text-xs text-slate-700 mt-4">© 2026 Wingman</p>
            </div>

            {/* Right — links */}
            <div className="md:text-right">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-3">Links</p>
              <div className="flex flex-col gap-2.5 md:items-end">
                <a
                  href="https://github.com/priyankbagad/wingman-ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#6b6b7e] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  GitHub — wingman-ai
                </a>
                <a
                  href="https://priyankbagad.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#6b6b7e] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
