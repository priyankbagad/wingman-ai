import { Router } from 'express'
import { MOCK_CRMS } from '../data/mock-crms.js'
import { adaptSalesforceAccounts, adaptSalesforceContacts, adaptSalesforceNotes } from '../adapters/salesforce.js'
import { adaptHubspotAccounts, adaptHubspotContacts, adaptHubspotNotes } from '../adapters/hubspot.js'
import { adaptPipedriveAccounts, adaptPipedriveContacts, adaptPipedriveNotes } from '../adapters/pipedrive.js'

const router = Router()

// Normalize adapted (camelCase) accounts to the snake_case schema the frontend expects
function toFrontend(acc) {
  return {
    id: acc.id,
    name: acc.name,
    industry: acc.industry,
    contract_value: acc.contractValue,
    renewal_date: acc.renewalDate,
    health_score: acc.healthScore,
    source: acc.source,
    contacts: (acc.contacts || []).map(c => ({
      name: c.name,
      role: c.role,
      email: c.email,
      is_primary: c.isPrimary,
    })),
    notes: (acc.notes || []).map(n => ({
      content: n.content,
      created_at: n.createdAt,
      type: n.type,
    })),
  }
}

router.get('/accounts/:crm', (req, res) => {
  const { crm } = req.params
  const crmData = MOCK_CRMS[crm]
  if (!crmData) return res.status(404).json({ error: `CRM "${crm}" not found` })

  let accounts = []

  if (crm === 'salesforce') {
    accounts = adaptSalesforceAccounts(crmData.accounts).map((acc, i) => ({
      ...acc,
      contacts: adaptSalesforceContacts(crmData.accounts[i].contacts),
      notes:    adaptSalesforceNotes(crmData.accounts[i].tasks),
    }))
  } else if (crm === 'hubspot') {
    accounts = adaptHubspotAccounts(crmData.accounts).map((acc, i) => ({
      ...acc,
      contacts: adaptHubspotContacts(crmData.accounts[i].contacts),
      notes:    adaptHubspotNotes(crmData.accounts[i].engagements),
    }))
  } else if (crm === 'pipedrive') {
    accounts = adaptPipedriveAccounts(crmData.accounts).map((acc, i) => ({
      ...acc,
      contacts: adaptPipedriveContacts(crmData.accounts[i].contacts),
      notes:    adaptPipedriveNotes(crmData.accounts[i].notes),
    }))
  }

  res.json({
    crm,
    label: crmData.label,
    tier: crmData.tier,
    accounts: accounts.map(toFrontend),
  })
})

export default router
