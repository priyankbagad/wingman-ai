export function adaptSalesforceAccounts(accounts) {
  return accounts.map(a => ({
    id: a.Id,
    name: a.Name,
    industry: a.Industry,
    contractValue: a.AnnualRevenue,
    renewalDate: a.ContractEndDate,
    healthScore: a.HealthScore__c,
    source: 'salesforce',
  }))
}

export function adaptSalesforceContacts(contacts) {
  return contacts.map(c => ({
    name: `${c.FirstName} ${c.LastName}`,
    role: c.Title,
    email: c.Email,
    isPrimary: c.IsPrimary__c,
  }))
}

export function adaptSalesforceNotes(tasks) {
  return tasks.map(t => ({
    content: t.Description,
    createdAt: t.ActivityDate,
    type: 'call',
  }))
}
