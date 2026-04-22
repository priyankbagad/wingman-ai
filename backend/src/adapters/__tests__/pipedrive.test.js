import { describe, it, expect } from 'vitest'
import {
  adaptPipedriveAccounts,
  adaptPipedriveContacts,
  adaptPipedriveNotes,
} from '../pipedrive.js'

describe('adaptPipedriveAccounts', () => {
  it('maps org fields to internal schema', () => {
    const input = [{
      id: 'pd-001',
      name: 'Vantage Retail Co.',
      industry: 'Retail',
      deal_value: 80000,
      expected_close_date: '2025-09-30',
      health_score: 1,
    }]
    expect(adaptPipedriveAccounts(input)).toEqual([{
      id: 'pd-001',
      name: 'Vantage Retail Co.',
      industry: 'Retail',
      contractValue: 80000,
      renewalDate: '2025-09-30',
      healthScore: 1,
      source: 'pipedrive',
    }])
  })

  it('defaults industry to "Sales" when missing', () => {
    const input = [{ id: 'pd-002', name: 'Acme' }]
    expect(adaptPipedriveAccounts(input)[0].industry).toBe('Sales')
  })

  it('defaults contractValue to 0 when deal_value is absent', () => {
    const input = [{ id: 'pd-003', name: 'Acme' }]
    expect(adaptPipedriveAccounts(input)[0].contractValue).toBe(0)
  })

  it('defaults healthScore to 5 when missing', () => {
    const input = [{ id: 'pd-004', name: 'Acme' }]
    expect(adaptPipedriveAccounts(input)[0].healthScore).toBe(5)
  })

  it('returns empty array for empty input', () => {
    expect(adaptPipedriveAccounts([])).toEqual([])
  })
})

describe('adaptPipedriveContacts', () => {
  it('maps person fields to contact schema', () => {
    const input = [{
      name: 'Marcus Lee',
      job_title: 'Account Manager',
      email: [{ value: 'mlee@vantage.com', primary: true }],
      primary_flag: true,
    }]
    expect(adaptPipedriveContacts(input)).toEqual([{
      name: 'Marcus Lee',
      role: 'Account Manager',
      email: 'mlee@vantage.com',
      isPrimary: true,
    }])
  })

  it('extracts value from first email in array', () => {
    const input = [{
      name: 'Ali B',
      job_title: 'SDR',
      email: [{ value: 'first@example.com' }, { value: 'second@example.com' }],
      primary_flag: false,
    }]
    expect(adaptPipedriveContacts(input)[0].email).toBe('first@example.com')
  })

  it('returns empty string when email array is null', () => {
    const input = [{ name: 'No Email', job_title: 'SDR', email: null }]
    expect(adaptPipedriveContacts(input)[0].email).toBe('')
  })

  it('returns empty string when email array is empty', () => {
    const input = [{ name: 'Empty Email', job_title: 'SDR', email: [] }]
    expect(adaptPipedriveContacts(input)[0].email).toBe('')
  })

  it('defaults isPrimary to false when primary_flag is absent', () => {
    const input = [{ name: 'X', job_title: 'Y', email: [] }]
    expect(adaptPipedriveContacts(input)[0].isPrimary).toBe(false)
  })

  it('returns empty array for empty input', () => {
    expect(adaptPipedriveContacts([])).toEqual([])
  })
})

describe('adaptPipedriveNotes', () => {
  it('maps note fields correctly', () => {
    const input = [{ content: 'Discussed Q4 roadmap', add_time: '2024-10-15' }]
    expect(adaptPipedriveNotes(input)).toEqual([{
      content: 'Discussed Q4 roadmap',
      createdAt: '2024-10-15',
      type: 'note',
    }])
  })

  it('maps multiple notes', () => {
    const input = [
      { content: 'Note A', add_time: '2024-10-01' },
      { content: 'Note B', add_time: '2024-11-01' },
    ]
    expect(adaptPipedriveNotes(input)).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(adaptPipedriveNotes([])).toEqual([])
  })
})
