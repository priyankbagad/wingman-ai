export function adaptHubspotAccounts(companies) {
  return companies.map(c => ({
    id: c.id,
    name: c.properties.name,
    industry: c.properties.industry,
    contractValue: parseInt(c.properties.annualrevenue || 0),
    renewalDate: c.properties.hs_renewal_date,
    healthScore: parseInt(c.properties.health_score || 5),
    source: 'hubspot',
  }))
}

export function adaptHubspotContacts(contacts) {
  return contacts.map(c => ({
    name: `${c.properties.firstname} ${c.properties.lastname}`,
    role: c.properties.jobtitle,
    email: c.properties.email,
    isPrimary: false,
  }))
}

export function adaptHubspotNotes(engagements) {
  return engagements.map(e => ({
    content: e.metadata?.body || e.metadata?.text || '',
    createdAt: new Date(e.engagement.createdAt).toISOString(),
    type: e.engagement.type?.toLowerCase() || 'note',
  }))
}
