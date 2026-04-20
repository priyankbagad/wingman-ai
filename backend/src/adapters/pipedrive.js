export function adaptPipedriveAccounts(orgs) {
  return orgs.map(o => ({
    id: o.id,
    name: o.name,
    industry: o.industry || 'Sales',
    contractValue: o.deal_value || 0,
    renewalDate: o.expected_close_date,
    healthScore: o.health_score || 5,
    source: 'pipedrive',
  }))
}

export function adaptPipedriveContacts(persons) {
  return persons.map(p => ({
    name: p.name,
    role: p.job_title,
    email: p.email?.[0]?.value || '',
    isPrimary: p.primary_flag || false,
  }))
}

export function adaptPipedriveNotes(notes) {
  return notes.map(n => ({
    content: n.content,
    createdAt: n.add_time,
    type: 'note',
  }))
}
