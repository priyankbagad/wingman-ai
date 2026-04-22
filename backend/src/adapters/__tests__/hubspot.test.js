import { describe, it, expect } from 'vitest'
import {
  adaptHubspotAccounts,
  adaptHubspotContacts,
  adaptHubspotNotes,
} from '../hubspot.js'

describe('adaptHubspotAccounts', () => {
  it('reads from nested properties object', () => {
    const input = [{
      id: 'hs-001',
      properties: {
        name: 'Helix Biotech',
        industry: 'Biotechnology',
        annualrevenue: '500000',
        hs_renewal_date: '2025-06-30',
        health_score: '9',
      },
    }]
    expect(adaptHubspotAccounts(input)).toEqual([{
      id: 'hs-001',
      name: 'Helix Biotech',
      industry: 'Biotechnology',
      contractValue: 500000,
      renewalDate: '2025-06-30',
      healthScore: 9,
      source: 'hubspot',
    }])
  })

  it('defaults contractValue to 0 when annualrevenue is absent', () => {
    const input = [{ id: 'hs-002', properties: { name: 'Acme' } }]
    expect(adaptHubspotAccounts(input)[0].contractValue).toBe(0)
  })

  it('defaults healthScore to 5 when health_score is absent', () => {
    const input = [{ id: 'hs-003', properties: { name: 'Acme' } }]
    expect(adaptHubspotAccounts(input)[0].healthScore).toBe(5)
  })

  it('parses string revenue and score to integers', () => {
    const input = [{ id: 'hs-004', properties: { name: 'Acme', annualrevenue: '99999', health_score: '7' } }]
    const result = adaptHubspotAccounts(input)[0]
    expect(result.contractValue).toBe(99999)
    expect(result.healthScore).toBe(7)
  })

  it('returns empty array for empty input', () => {
    expect(adaptHubspotAccounts([])).toEqual([])
  })
})

describe('adaptHubspotContacts', () => {
  it('concatenates firstname and lastname from properties', () => {
    const input = [{
      properties: {
        firstname: 'Sarah',
        lastname: 'Chen',
        jobtitle: 'CTO',
        email: 'schen@helix.com',
      },
    }]
    expect(adaptHubspotContacts(input)).toEqual([{
      name: 'Sarah Chen',
      role: 'CTO',
      email: 'schen@helix.com',
      isPrimary: false,
    }])
  })

  it('always sets isPrimary to false (HubSpot has no primary flag)', () => {
    const input = [{ properties: { firstname: 'A', lastname: 'B', jobtitle: 'CEO', email: 'a@b.com' } }]
    expect(adaptHubspotContacts(input)[0].isPrimary).toBe(false)
  })

  it('returns empty array for empty input', () => {
    expect(adaptHubspotContacts([])).toEqual([])
  })
})

describe('adaptHubspotNotes', () => {
  it('extracts body from metadata', () => {
    const input = [{
      engagement: { createdAt: 1700000000000, type: 'NOTE' },
      metadata: { body: 'Renewal call went well' },
    }]
    const result = adaptHubspotNotes(input)
    expect(result[0].content).toBe('Renewal call went well')
    expect(result[0].type).toBe('note')
  })

  it('falls back to metadata.text when body is absent', () => {
    const input = [{
      engagement: { createdAt: 1700000000000, type: 'EMAIL' },
      metadata: { text: 'Sent follow-up email' },
    }]
    expect(adaptHubspotNotes(input)[0].content).toBe('Sent follow-up email')
  })

  it('returns empty string when both body and text are absent', () => {
    const input = [{
      engagement: { createdAt: 1700000000000, type: 'CALL' },
      metadata: {},
    }]
    expect(adaptHubspotNotes(input)[0].content).toBe('')
  })

  it('lowercases engagement type', () => {
    const input = [{
      engagement: { createdAt: 1700000000000, type: 'MEETING' },
      metadata: { body: 'Quarterly review' },
    }]
    expect(adaptHubspotNotes(input)[0].type).toBe('meeting')
  })

  it('defaults type to "note" when engagement type is absent', () => {
    const input = [{
      engagement: { createdAt: 1700000000000 },
      metadata: { body: 'Something happened' },
    }]
    expect(adaptHubspotNotes(input)[0].type).toBe('note')
  })

  it('converts createdAt timestamp to ISO string', () => {
    const ts = 1700000000000
    const input = [{ engagement: { createdAt: ts, type: 'NOTE' }, metadata: { body: 'x' } }]
    expect(adaptHubspotNotes(input)[0].createdAt).toBe(new Date(ts).toISOString())
  })

  it('returns empty array for empty input', () => {
    expect(adaptHubspotNotes([])).toEqual([])
  })
})
