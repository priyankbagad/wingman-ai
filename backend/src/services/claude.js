import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an AI sales assistant. Given CRM context about an account, generate a structured pre-meeting briefing with these sections:

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
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Here is the CRM context for this account:\n\n${contextText}`,
      },
    ],
  });

  return message.content[0].text;
}
