export const normalizeAccount = (raw) => ({
  id: raw.id,
  name: raw.name,
  industry: raw.industry,
  contractValue: raw.contractValue,
  renewalDate: raw.renewalDate,
  healthScore: raw.healthScore,
  source: raw.source,
})

export const normalizeContact = (raw) => ({
  name: raw.name,
  role: raw.role,
  email: raw.email,
  isPrimary: raw.isPrimary || false,
})

export const normalizeNote = (raw) => ({
  content: raw.content,
  createdAt: raw.createdAt,
  type: raw.type || 'note',
})
