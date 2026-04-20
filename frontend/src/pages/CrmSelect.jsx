import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const CRM_CONFIG = {
  salesforce: {
    label: 'Salesforce',
    tier: 'Enterprise',
    abbr: 'SF',
    color: '#00A1E0',
    hoverBorderClass: 'hover:border-[#00A1E0]/50',
    accounts: ['TechCorp Industries', 'GlobalBank Financial', 'MedDevice Corp'],
  },
  hubspot: {
    label: 'HubSpot',
    tier: 'Growth',
    abbr: 'HS',
    color: '#FF7A59',
    hoverBorderClass: 'hover:border-[#FF7A59]/50',
    accounts: ['GrowthStack SaaS', 'Bloom Ecommerce', 'Launchpad Agency'],
  },
  pipedrive: {
    label: 'Pipedrive',
    tier: 'Startup',
    abbr: 'PD',
    color: '#6366f1',
    hoverBorderClass: 'hover:border-indigo-500/50',
    accounts: ['Quicksell Pro', 'DealFlow Inc', 'SalesBoost Co'],
  },
}

function CrmCard({ id, config, connecting, onSelect }) {
  const isConnecting = connecting === id
  const isOther = connecting !== null && connecting !== id

  return (
    <motion.button
      onClick={() => !connecting && onSelect(id)}
      className={[
        'relative text-left bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 w-full',
        'transition-all duration-200 focus:outline-none',
        config.hoverBorderClass,
        isOther ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        isConnecting ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : '',
      ].join(' ')}
      whileHover={!connecting ? { y: -2 } : {}}
      transition={{ duration: 0.15 }}
    >
      {/* CRM icon circle */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-5"
        style={{ backgroundColor: config.color }}
      >
        {config.abbr}
      </div>

      {/* Name + tier */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl font-semibold text-white">{config.label}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b7e] bg-[#1e1e2e] border border-[#2a2a3e] rounded px-1.5 py-0.5">
          {config.tier}
        </span>
      </div>

      <p className="text-xs text-[#6b6b7e] mb-5">
        {config.accounts.length} accounts ready to import
      </p>

      {/* Account list */}
      <ul className="space-y-1.5 mb-6">
        {config.accounts.map(name => (
          <li key={name} className="flex items-center gap-2 text-xs text-[#6b6b7e]">
            <span className="w-1 h-1 rounded-full bg-[#2a2a3e] shrink-0" />
            {name}
          </li>
        ))}
      </ul>

      {/* Footer CTA */}
      <div className="flex items-center gap-2">
        {isConnecting ? (
          <>
            <span className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
            <span className="text-sm text-indigo-400">Connecting to {config.label}…</span>
          </>
        ) : (
          <span className="text-sm text-indigo-400 group-hover:text-indigo-300">
            Connect {config.label} →
          </span>
        )}
      </div>
    </motion.button>
  )
}

export function CrmSelect({ onCrmSelect, onBack }) {
  const [connecting, setConnecting] = useState(null)

  async function handleSelect(crmId) {
    setConnecting(crmId)
    await new Promise(r => setTimeout(r, 1500))
    onCrmSelect(crmId)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Back button */}
      <div className="px-8 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#6b6b7e] hover:text-[#f4f4f8] transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[#1e1e2e] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-xs text-[#6b6b7e]">Step 1 of 1</span>
        </div>

        <h1 className="text-3xl font-semibold text-white text-center">Connect your CRM</h1>
        <p className="text-[#6b6b7e] mt-2 mb-10 text-center max-w-md">
          Select your CRM to load your accounts into Wingman.
        </p>

        {/* CRM cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {Object.entries(CRM_CONFIG).map(([id, config]) => (
            <CrmCard
              key={id}
              id={id}
              config={config}
              connecting={connecting}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <p className="text-xs text-[#4b5563] mt-8">
          This is a demo — no real CRM connection required
        </p>
      </div>
    </div>
  )
}
