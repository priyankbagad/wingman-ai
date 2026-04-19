import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { embedText } from '../services/embed.js';
import { generateBriefing } from '../services/claude.js';

const router = Router();

router.post('/', async (req, res) => {
  const { company } = req.body;

  if (!company?.trim()) {
    return res.status(400).json({ error: 'company name is required' });
  }

  // 1. Look up account (case-insensitive)
  const { data: accounts, error: accountErr } = await supabase
    .from('accounts')
    .select('*')
    .ilike('name', company.trim())
    .limit(1);

  if (accountErr) {
    console.error('Supabase account lookup error:', accountErr);
    return res.status(500).json({ error: 'Database error looking up account' });
  }

  if (!accounts?.length) {
    return res.status(404).json({ error: `No account found matching "${company}"` });
  }

  const account = accounts[0];

  // 2. Fetch contacts
  const { data: contacts, error: contactErr } = await supabase
    .from('contacts')
    .select('name, role, email')
    .eq('account_id', account.id);

  if (contactErr) {
    console.error('Supabase contacts error:', contactErr);
    return res.status(500).json({ error: 'Database error fetching contacts' });
  }

  // 3. Embed the query string
  let embedding;
  try {
    embedding = await embedText(company.trim());
  } catch (err) {
    console.error('Gemini embedding error:', err);
    return res.status(500).json({ error: 'Failed to generate embedding' });
  }

  // 4. Semantic search for top 5 relevant notes via match_notes()
  const { data: notes, error: notesErr } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    filter_account_id: account.id,
    match_count: 5,
  });

  if (notesErr) {
    console.error('Supabase match_notes error:', notesErr);
    return res.status(500).json({ error: 'Vector search failed' });
  }

  // 5. Build context string
  const renewalDate = account.renewal_date
    ? new Date(account.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'unknown';

  const contactsText = (contacts ?? [])
    .map((c) => `- ${c.name} (${c.role}) — ${c.email}`)
    .join('\n');

  const notesText = (notes ?? [])
    .map((n, i) => `Note ${i + 1} [similarity: ${n.similarity?.toFixed(2) ?? 'n/a'}]:\n${n.content}`)
    .join('\n\n');

  const contextText = `
ACCOUNT
Name: ${account.name}
Industry: ${account.industry}
Annual Contract Value: $${account.contract_value?.toLocaleString() ?? 'unknown'}
Renewal Date: ${renewalDate}
Health Score: ${account.health_score}/10

CONTACTS
${contactsText || 'No contacts on file'}

RELEVANT CRM NOTES (retrieved via semantic search)
${notesText || 'No notes on file'}
`.trim();

  // 6. Generate briefing with Claude
  let briefing;
  try {
    briefing = await generateBriefing(contextText);
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Failed to generate briefing' });
  }

  // 7. Return structured response
  res.json({
    account: {
      id: account.id,
      name: account.name,
      industry: account.industry,
      contract_value: account.contract_value,
      renewal_date: account.renewal_date,
      health_score: account.health_score,
    },
    contacts: contacts ?? [],
    notes_used: (notes ?? []).map((n) => ({
      content: n.content,
      similarity: n.similarity,
      created_at: n.created_at,
    })),
    briefing,
  });
});

export default router;
