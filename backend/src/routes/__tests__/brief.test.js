import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../../services/supabase.js', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))
vi.mock('../../services/embed.js', () => ({
  embedText: vi.fn(),
}))
vi.mock('../../services/claude.js', () => ({
  generateBriefing: vi.fn(),
  generateRiskAnalysis: vi.fn(),
  generateTalkTrack: vi.fn(),
}))
vi.mock('../../services/news.js', () => ({
  fetchNews: vi.fn(),
}))

import { supabase } from '../../services/supabase.js'
import { embedText } from '../../services/embed.js'
import { generateBriefing, generateRiskAnalysis, generateTalkTrack } from '../../services/claude.js'
import { fetchNews } from '../../services/news.js'
import briefRouter from '../brief.js'

const app = express()
app.use(express.json())
app.use('/', briefRouter)

const mockAccount = {
  id: 'acc-001',
  name: 'Meridian Logistics',
  industry: 'Logistics',
  contract_value: 120000,
  renewal_date: '2025-03-15',
  health_score: 3,
}

const mockContacts = [
  { name: 'Jordan Kim', role: 'VP Operations', email: 'jkim@meridian.com' },
]

const mockNotes = [
  { content: 'Missed renewal call in November', similarity: 0.89, created_at: '2024-11-01' },
]

const mockRisk = { score: 7, level: 'high', reasons: ['Missed renewal call'], recommendation: 'Schedule EBR.' }
const mockTalkTrack = ['Jordan, I saw the Q3 report...', 'How did the hub expansion land?', 'What is the status of the support tickets?']

beforeEach(() => {
  vi.clearAllMocks()
  generateBriefing.mockResolvedValue('## Account Overview\n...')
  generateRiskAnalysis.mockResolvedValue(mockRisk)
  generateTalkTrack.mockResolvedValue(mockTalkTrack)
  fetchNews.mockResolvedValue([])
  embedText.mockResolvedValue(new Array(768).fill(0.1))
})

// ── Input validation ────────────────────────────────────────────────────────

describe('input validation', () => {
  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('company name is required')
  })

  it('returns 400 when company is whitespace only', async () => {
    const res = await request(app).post('/').send({ company: '   ' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('company name is required')
  })
})

// ── Supabase path ────────────────────────────────────────────────────────────

describe('Supabase path', () => {
  beforeEach(() => {
    supabase.from.mockImplementation((table) => {
      if (table === 'accounts') {
        return {
          select: () => ({ ilike: () => ({ limit: () => Promise.resolve({ data: [mockAccount], error: null }) }) }),
        }
      }
      if (table === 'contacts') {
        return {
          select: () => ({ eq: () => Promise.resolve({ data: mockContacts, error: null }) }),
        }
      }
    })
    supabase.rpc.mockResolvedValue({ data: mockNotes, error: null })
  })

  it('returns 200 with full briefing payload', async () => {
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(200)
    expect(res.body.account.name).toBe('Meridian Logistics')
    expect(res.body.briefing).toBeDefined()
    expect(res.body.risk_analysis).toEqual(mockRisk)
    expect(res.body.talk_track).toEqual(mockTalkTrack)
    expect(res.body.contacts).toHaveLength(1)
    expect(res.body.notes_used).toHaveLength(1)
    expect(res.body.notes_used[0].similarity).toBe(0.89)
  })

  it('returns 404 when account is not found in Supabase', async () => {
    supabase.from.mockImplementation(() => ({
      select: () => ({ ilike: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
    }))
    const res = await request(app).post('/').send({ company: 'Unknown Corp' })
    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/No account found matching "Unknown Corp"/)
  })

  it('returns 500 when Supabase account lookup errors', async () => {
    supabase.from.mockImplementation(() => ({
      select: () => ({ ilike: () => ({ limit: () => Promise.resolve({ data: null, error: { message: 'connection timeout' } }) }) }),
    }))
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Database error looking up account')
  })

  it('returns 500 when contacts fetch throws', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'accounts') {
        return {
          select: () => ({ ilike: () => ({ limit: () => Promise.resolve({ data: [mockAccount], error: null }) }) }),
        }
      }
      if (table === 'contacts') {
        return {
          select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'contacts error' } }) }),
        }
      }
    })
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Failed to fetch contacts or generate embedding')
  })

  it('returns 500 when vector search errors', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'pgvector error' } })
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Vector search failed')
  })

  it('returns 500 when Claude API throws', async () => {
    generateBriefing.mockRejectedValue(new Error('rate limit exceeded'))
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Failed to generate briefing')
  })

  it('includes news articles when Serper returns results', async () => {
    const mockNews = [{ title: 'Meridian Expands', snippet: 'Miami hub opens', date: '2025-01-10', url: 'https://news.example.com' }]
    fetchNews.mockResolvedValue(mockNews)
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(200)
    expect(res.body.news).toHaveLength(1)
    expect(res.body.news[0].title).toBe('Meridian Expands')
  })

  it('returns empty news array when Serper returns nothing', async () => {
    fetchNews.mockResolvedValue([])
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.body.news).toEqual([])
  })

  it('handles account with no notes gracefully', async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null })
    const res = await request(app).post('/').send({ company: 'Meridian Logistics' })
    expect(res.status).toBe(200)
    expect(res.body.notes_used).toEqual([])
  })
})

// ── CRM fast-path ─────────────────────────────────────────────────────────────

describe('CRM fast-path', () => {
  const crmAccount = {
    id: 'sf-001',
    name: 'Helix Biotech',
    industry: 'Biotechnology',
    contract_value: 500000,
    renewal_date: '2025-06-30',
    health_score: 9,
    source: 'salesforce',
    contacts: [{ name: 'Sarah Chen', role: 'CTO', email: 'schen@helix.com' }],
    notes: [{ type: 'call', content: 'Expansion conversation went well' }],
  }

  it('skips Supabase and uses provided CRM data', async () => {
    const res = await request(app).post('/').send({ company: 'Helix Biotech', crmAccount })
    expect(res.status).toBe(200)
    expect(res.body.account.name).toBe('Helix Biotech')
    expect(res.body.notes_used).toEqual([])
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns contacts from crmAccount directly', async () => {
    const res = await request(app).post('/').send({ company: 'Helix Biotech', crmAccount })
    expect(res.body.contacts).toEqual(crmAccount.contacts)
  })

  it('handles crmAccount with no contacts or notes', async () => {
    const minimal = { ...crmAccount, contacts: [], notes: [] }
    const res = await request(app).post('/').send({ company: 'Helix Biotech', crmAccount: minimal })
    expect(res.status).toBe(200)
    expect(res.body.contacts).toEqual([])
  })

  it('returns 500 when Claude fails on CRM path', async () => {
    generateBriefing.mockRejectedValue(new Error('timeout'))
    const res = await request(app).post('/').send({ company: 'Helix Biotech', crmAccount })
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('Failed to generate briefing')
  })

  it('includes live news on CRM path', async () => {
    const mockNews = [{ title: 'Helix IPO', snippet: 'Biotech files S-1', date: '2025-02-01', url: 'https://news.example.com' }]
    fetchNews.mockResolvedValue(mockNews)
    const res = await request(app).post('/').send({ company: 'Helix Biotech', crmAccount })
    expect(res.body.news).toHaveLength(1)
  })
})
