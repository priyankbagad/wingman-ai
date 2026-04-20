import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { embedText } from '../services/embed.js';
import { generateBriefing, generateRiskAnalysis, generateTalkTrack } from '../services/claude.js';
import { fetchNews } from '../services/news.js';

const router = Router();

router.post('/', async (req, res) => {
  const { company, crmAccount } = req.body;

  if (!company?.trim()) {
    return res.status(400).json({ error: 'company name is required' });
  }

  // ── CRM fast-path: account data supplied directly, skip Supabase ─────────
  if (crmAccount) {
    const newsPromise = fetchNews(company.trim());

    const renewalDate = crmAccount.renewal_date
      ? new Date(crmAccount.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'unknown';

    const contactsText = (crmAccount.contacts ?? [])
      .map((c) => `- ${c.name} (${c.role}) — ${c.email}`)
      .join('\n');

    const notesText = (crmAccount.notes ?? [])
      .map((n, i) => `Note ${i + 1} [${n.type}]:\n${n.content}`)
      .join('\n\n');

    const news = await newsPromise;
    const newsText = news.length > 0
      ? `\n\nRECENT NEWS\n${news.map((n) => `- ${n.title}: ${n.snippet}`).join('\n')}`
      : '';

    const contextText = `ACCOUNT
Name: ${crmAccount.name}
Industry: ${crmAccount.industry}
Annual Contract Value: $${crmAccount.contract_value?.toLocaleString() ?? 'unknown'}
Renewal Date: ${renewalDate}
Health Score: ${crmAccount.health_score}/10
Source CRM: ${crmAccount.source ?? 'unknown'}

CONTACTS
${contactsText || 'No contacts on file'}

CRM NOTES
${notesText || 'No notes on file'}${newsText}`;

    let briefing, risk_analysis, talk_track;
    try {
      [briefing, risk_analysis, talk_track] = await Promise.all([
        generateBriefing(contextText),
        generateRiskAnalysis(contextText),
        generateTalkTrack(contextText),
      ]);
    } catch (err) {
      console.error('Claude API error (CRM path):', err);
      return res.status(500).json({ error: 'Failed to generate briefing' });
    }

    return res.json({
      account: {
        id:             crmAccount.id,
        name:           crmAccount.name,
        industry:       crmAccount.industry,
        contract_value: crmAccount.contract_value,
        renewal_date:   crmAccount.renewal_date,
        health_score:   crmAccount.health_score,
      },
      contacts:   crmAccount.contacts ?? [],
      notes_used: [],
      briefing,
      risk_analysis,
      talk_track,
      news,
    });
  }

  // ── Supabase fallback path ────────────────────────────────────────────────

  // Kick off news search immediately — runs in parallel with the full CRM pipeline
  const newsPromise = fetchNews(company.trim());

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

  // 2. Fetch contacts and embed query in parallel — both need the account but not each other
  let contacts, embedding;
  try {
    const [contactsResult, emb] = await Promise.all([
      supabase.from('contacts').select('name, role, email').eq('account_id', account.id),
      embedText(company.trim()),
    ]);
    if (contactsResult.error) throw new Error(contactsResult.error.message);
    contacts = contactsResult.data;
    embedding = emb;
  } catch (err) {
    console.error('Contacts/embed error:', err);
    return res.status(500).json({ error: 'Failed to fetch contacts or generate embedding' });
  }

  // 3. Vector search for top 5 semantically similar notes
  const { data: notes, error: notesErr } = await supabase.rpc('match_notes', {
    query_embedding: embedding,
    filter_account_id: account.id,
    match_count: 5,
  });

  if (notesErr) {
    console.error('Supabase match_notes error:', notesErr);
    return res.status(500).json({ error: 'Vector search failed' });
  }

  // 4. Await news (started at request-time, almost certainly resolved by now)
  const news = await newsPromise;

  // 5. Build context — include live news so all 3 Claude calls are news-aware
  const renewalDate = account.renewal_date
    ? new Date(account.renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'unknown';

  const contactsText = (contacts ?? [])
    .map((c) => `- ${c.name} (${c.role}) — ${c.email}`)
    .join('\n');

  const notesText = (notes ?? [])
    .map((n, i) => `Note ${i + 1} [similarity: ${n.similarity?.toFixed(2) ?? 'n/a'}]:\n${n.content}`)
    .join('\n\n');

  const newsText = news.length > 0
    ? `\n\nRECENT NEWS\n${news.map((n) => `- ${n.title}: ${n.snippet}`).join('\n')}`
    : '';

  const contextText = `ACCOUNT
Name: ${account.name}
Industry: ${account.industry}
Annual Contract Value: $${account.contract_value?.toLocaleString() ?? 'unknown'}
Renewal Date: ${renewalDate}
Health Score: ${account.health_score}/10

CONTACTS
${contactsText || 'No contacts on file'}

RELEVANT CRM NOTES (retrieved via semantic search)
${notesText || 'No notes on file'}${newsText}`;

  // 6. Run all 3 Claude calls in parallel
  let briefing, risk_analysis, talk_track;
  try {
    [briefing, risk_analysis, talk_track] = await Promise.all([
      generateBriefing(contextText),
      generateRiskAnalysis(contextText),
      generateTalkTrack(contextText),
    ]);
  } catch (err) {
    console.error('Claude API error:', err);
    return res.status(500).json({ error: 'Failed to generate briefing' });
  }

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
    risk_analysis,
    talk_track,
    news,
  });
});

export default router;
