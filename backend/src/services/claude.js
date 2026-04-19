import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Strip markdown code fences Claude sometimes wraps JSON in despite instructions
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : text.trim();
}

// ─── Briefing ─────────────────────────────────────────────────────────────────

const BRIEFING_SYSTEM = `You are an AI sales assistant. Given CRM context about an account, generate a structured pre-meeting briefing with these sections:

## Account Overview
Summarize the account: industry, contract value, renewal date, and current health score.

## Key Contacts
List each contact with their role and one sentence on what we know about them.

## Risk Signals
Identify the top risks to renewal or relationship health based on the notes.

## Recommended Talking Points
3–5 specific, actionable talking points the rep should raise in the meeting.

Be concise and direct. Avoid generic filler. Every sentence should be useful to the rep.`;

export async function generateBriefing(contextText) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: BRIEFING_SYSTEM,
    messages: [{ role: 'user', content: `CRM context:\n\n${contextText}` }],
  });
  return msg.content[0].text;
}

// ─── Risk analysis ────────────────────────────────────────────────────────────

const RISK_SYSTEM = `You are a customer success risk analyst. Given CRM data, return ONLY a JSON object with these exact fields:
- score: integer 1–10 where 10 = highest risk
- level: exactly one of "critical", "high", "medium", "low"
- reasons: array of up to 3 short strings (max 12 words each)
- recommendation: one direct, specific sentence for the sales rep

Return raw JSON only. No markdown, no code blocks, no explanation.`;

export async function generateRiskAnalysis(contextText) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: RISK_SYSTEM,
    messages: [{ role: 'user', content: `CRM context:\n\n${contextText}` }],
  });
  try {
    return JSON.parse(extractJSON(msg.content[0].text));
  } catch {
    return { score: 5, level: 'medium', reasons: [], recommendation: 'Review account history before the call.' };
  }
}

// ─── Talk track ───────────────────────────────────────────────────────────────

const TALK_TRACK_SYSTEM = `You are a sales coach. Given CRM context, generate exactly 3 specific opening lines a sales rep could say verbatim at the start of this meeting. Requirements:
- Direct and human, never corporate-speak
- Reference real, specific details from the CRM notes (names, dates, incidents)
- Each line should stand alone — the rep picks one, not all three

Return ONLY a JSON array of exactly 3 strings. No markdown, no code blocks, no other text.`;

export async function generateTalkTrack(contextText) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: TALK_TRACK_SYSTEM,
    messages: [{ role: 'user', content: `CRM context:\n\n${contextText}` }],
  });
  try {
    return JSON.parse(extractJSON(msg.content[0].text));
  } catch {
    return [];
  }
}
