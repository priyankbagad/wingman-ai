import { describe, it, expect } from 'vitest'
import {
  adaptSalesforceAccounts,
  adaptSalesforceContacts,
  adaptSalesforceNotes,
} from '../salesforce.js'

describe('adaptSalesforceAccounts', () => {
  it('maps raw Salesforce fields to internal schema', () => {
    const input = [{
      Id: 'sf-001',
      Name: 'Meridian Logistics',
      Industry: 'Logistics',
      AnnualRevenue: 120000,
      ContractEndDate: '2025-03-15',
      HealthScore__c: 3,
    }]
    expect(adaptSalesforceAccounts(input)).toEqual([{
      id: 'sf-001',
      name: 'Meridian Logistics',
      industry: 'Logistics',
      contractValue: 120000,
      renewalDate: '2025-03-15',
      healthScore: 3,
      source: 'salesforce',
    }])
  })

  it('maps multiple accounts', () => {
    const input = [
      { Id: 'sf-001', Name: 'Acme', Industry: 'Tech', AnnualRevenue: 50000, ContractEndDate: '2025-01-01', HealthScore__c: 8 },
      { Id: 'sf-002', Name: 'Beta', Industry: 'Finance', AnnualRevenue: 200000, ContractEndDate: '2025-06-01', HealthScore__c: 5 },
    ]
    const result = adaptSalesforceAccounts(input)
    expect(result).toHaveLength(2)
    expect(result[1].id).toBe('sf-002')
  })

  it('returns empty array for empty input', () => {
    expect(adaptSalesforceAccounts([])).toEqual([])
  })

  it('passes through undefined fields without throwing', () => {
    const input = [{ Id: 'sf-003', Name: 'Ghost Corp' }]
    const result = adaptSalesforceAccounts(input)
    expect(result[0].id).toBe('sf-003')
    expect(result[0].industry).toBeUndefined()
    expect(result[0].contractValue).toBeUndefined()
  })
})

describe('adaptSalesforceContacts', () => {
  it('concatenates FirstName and LastName', () => {
    const input = [{
      FirstName: 'Jordan',
      LastName: 'Kim',
      Title: 'VP Operations',
      Email: 'jkim@meridian.com',
      IsPrimary__c: true,
    }]
    expect(adaptSalesforceContacts(input)).toEqual([{
      name: 'Jordan Kim',
      role: 'VP Operations',
      email: 'jkim@meridian.com',
      isPrimary: true,
    }])
  })

  it('sets isPrimary to false for non-primary contacts', () => {
    const input = [{ FirstName: 'Alex', LastName: 'Ray', Title: 'SDR', Email: 'aray@example.com', IsPrimary__c: false }]
    expect(adaptSalesforceContacts(input)[0].isPrimary).toBe(false)
  })

  it('returns empty array for empty input', () => {
    expect(adaptSalesforceContacts([])).toEqual([])
  })
})

describe('adaptSalesforceNotes', () => {
  it('maps task fields to note schema with type "call"', () => {
    const input = [{ Description: 'Discussed Q4 roadmap', ActivityDate: '2024-11-01' }]
    expect(adaptSalesforceNotes(input)).toEqual([{
      content: 'Discussed Q4 roadmap',
      createdAt: '2024-11-01',
      type: 'call',
    }])
  })

  it('maps multiple tasks', () => {
    const input = [
      { Description: 'Call 1', ActivityDate: '2024-10-01' },
      { Description: 'Call 2', ActivityDate: '2024-11-01' },
    ]
    expect(adaptSalesforceNotes(input)).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(adaptSalesforceNotes([])).toEqual([])
  })
})
