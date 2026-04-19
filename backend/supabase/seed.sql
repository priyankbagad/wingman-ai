-- =============================================================================
-- Wingman seed data — 5 accounts, mix of healthy / at-risk / churned
-- Run this after schema.sql
-- =============================================================================

-- ─── Accounts ────────────────────────────────────────────────────────────────

INSERT INTO accounts (id, name, industry, contract_value, renewal_date, health_score, created_at) VALUES
  -- 1. HERO demo account: renewal soon, frustrated contact, negative notes
  ('a1000000-0000-0000-0000-000000000001', 'Meridian Logistics', 'Supply Chain & Logistics', 84000,  NOW()::date + INTERVAL '18 days', 3, NOW() - INTERVAL '14 months'),

  -- 2. Healthy, expanding account
  ('a2000000-0000-0000-0000-000000000002', 'Helix Biotech', 'Life Sciences', 210000, NOW()::date + INTERVAL '7 months',  9, NOW() - INTERVAL '2 years'),

  -- 3. Mid-tier, stable
  ('a3000000-0000-0000-0000-000000000003', 'Crestwood Media', 'Media & Entertainment', 52000, NOW()::date + INTERVAL '4 months',  6, NOW() - INTERVAL '11 months'),

  -- 4. At-risk, low engagement
  ('a4000000-0000-0000-0000-000000000004', 'Pinnacle Legal Group', 'Legal Services', 38000, NOW()::date + INTERVAL '6 weeks',  4, NOW() - INTERVAL '18 months'),

  -- 5. Churned / lost — kept for historical context
  ('a5000000-0000-0000-0000-000000000005', 'Vantage Retail Co.', 'Retail', 29000, NOW()::date - INTERVAL '2 months',  1, NOW() - INTERVAL '3 years');


-- ─── Contacts ─────────────────────────────────────────────────────────────────

INSERT INTO contacts (account_id, name, role, email) VALUES
  -- Meridian Logistics (hero)
  ('a1000000-0000-0000-0000-000000000001', 'Sandra Okafor',  'VP of Operations',       'sandra.okafor@meridianlogistics.com'),
  ('a1000000-0000-0000-0000-000000000001', 'Derek Chung',    'IT Director',             'derek.chung@meridianlogistics.com'),
  ('a1000000-0000-0000-0000-000000000001', 'Rachel Torres',  'Procurement Manager',     'r.torres@meridianlogistics.com'),

  -- Helix Biotech
  ('a2000000-0000-0000-0000-000000000002', 'Dr. Priya Nair', 'Chief Scientific Officer','p.nair@helixbiotech.io'),
  ('a2000000-0000-0000-0000-000000000002', 'Marcus Webb',    'Head of IT Infrastructure','m.webb@helixbiotech.io'),

  -- Crestwood Media
  ('a3000000-0000-0000-0000-000000000003', 'Jonah Fitzgerald','Director of Partnerships','j.fitzgerald@crestwoodmedia.com'),
  ('a3000000-0000-0000-0000-000000000003', 'Alicia Stern',   'Finance Manager',         'a.stern@crestwoodmedia.com'),

  -- Pinnacle Legal Group
  ('a4000000-0000-0000-0000-000000000004', 'Thomas Reeve',   'Managing Partner',        't.reeve@pinnaclелegal.com'),
  ('a4000000-0000-0000-0000-000000000004', 'Grace Kim',      'Operations Lead',         'g.kim@pinnaclelegal.com'),

  -- Vantage Retail Co.
  ('a5000000-0000-0000-0000-000000000005', 'Brian Moss',     'CTO',                     'b.moss@vantageretail.com'),
  ('a5000000-0000-0000-0000-000000000005', 'Lisa Park',      'Head of Digital',         'l.park@vantageretail.com');


-- ─── Notes ────────────────────────────────────────────────────────────────────
-- embeddings are NULL here; the backend will populate them via Gemini on Day 2

INSERT INTO notes (account_id, content, created_at) VALUES

  -- ── Meridian Logistics (hero account: frustrated, churn risk, renewal in 18 days) ──

  ('a1000000-0000-0000-0000-000000000001',
   'Call with Sandra Okafor (VP Ops) — 45 min. She opened by saying the rollout has been "disappointing." Three of their five warehouse sites still cannot sync inventory in real time due to the API latency issue we escalated in February. She mentioned her team had to hire a contractor to manually reconcile records twice a week. Frustration level is high. She asked directly whether we plan to fix this before renewal.',
   NOW() - INTERVAL '5 days'),

  ('a1000000-0000-0000-0000-000000000001',
   'Email thread with Derek Chung (IT Director) — Derek shared server logs showing our connector timing out every 2–3 hours during peak load windows (6–9 AM EST). He has been troubleshooting with our support team for six weeks with no resolution. He CC''d Sandra on his last reply, which is a signal the issue is escalating internally. Tone was professional but clipped.',
   NOW() - INTERVAL '12 days'),

  ('a1000000-0000-0000-0000-000000000001',
   'QBR prep notes (internal) — Meridian is $84K ARR, renewal in 18 days. Health score dropped from 7 to 3 over last quarter. Primary risk: unresolved API latency bug. Secondary risk: Sandra hinted at evaluating a competitor (believed to be ShipHero) on our last call. Recommend bringing engineering lead to the renewal call and offering a 10% SLA credit to rebuild goodwill.',
   NOW() - INTERVAL '3 days'),

  ('a1000000-0000-0000-0000-000000000001',
   'Onboarding summary (14 months ago) — Meridian signed after a 6-week POC. Champion was Rachel Torres (Procurement). Key use case: unified visibility across 5 distribution centers. They were excited about the API-first approach. Initial rollout went smoothly at the Atlanta and Dallas sites.',
   NOW() - INTERVAL '13 months'),

  ('a1000000-0000-0000-0000-000000000001',
   'Support ticket #8821 escalation — Sandra Okafor submitted a formal complaint ticket flagging SLA breach. Our connector has exceeded the 99.5% uptime commitment for two consecutive months. Ticket priority bumped to P1. Customer Success has been looped in.',
   NOW() - INTERVAL '8 days'),


  -- ── Helix Biotech (healthy, expanding) ──

  ('a2000000-0000-0000-0000-000000000002',
   'Business review call with Dr. Priya Nair — Extremely positive. Helix has expanded usage to their clinical trials division and wants to explore an enterprise tier. Priya mentioned the data pipeline automation saved their team roughly 200 hours last quarter. She is an internal champion and willing to provide a case study quote.',
   NOW() - INTERVAL '3 weeks'),

  ('a2000000-0000-0000-0000-000000000002',
   'Expansion opportunity — Marcus Webb reached out asking about multi-region data residency (EU). Their regulatory team requires all PII to stay within the EU boundary. If we can confirm this capability, they are ready to add a €60K EU module to the contract at renewal.',
   NOW() - INTERVAL '6 days'),

  ('a2000000-0000-0000-0000-000000000002',
   'NPS survey response — Helix scored us 9/10. Feedback: "Best-in-class support team, product does exactly what it promises." One request: better audit log exports for their compliance team.',
   NOW() - INTERVAL '5 weeks'),


  -- ── Crestwood Media (mid-tier, stable) ──

  ('a3000000-0000-0000-0000-000000000003',
   'Check-in call with Jonah Fitzgerald — Usage is steady but not growing. Jonah says the team finds the reporting dashboard "clunky" — too many clicks to get to the metrics they care about. Not a deal-breaker but he mentioned a competitor demo they sat through last month.',
   NOW() - INTERVAL '2 weeks'),

  ('a3000000-0000-0000-0000-000000000003',
   'Email from Alicia Stern (Finance) — Asked for an updated W-9 and invoice breakdown for their Q2 budget reconciliation. No red flags, routine finance touchpoint. Replied same day.',
   NOW() - INTERVAL '1 week'),

  ('a3000000-0000-0000-0000-000000000003',
   'Renewal planning note — Crestwood renews in 4 months. Health is a 6. Main risk is UX dissatisfaction noted by Jonah. Opportunity: offer early renewal discount (5%) if signed 60 days out, and flag upcoming dashboard redesign on roadmap to address their concerns.',
   NOW() - INTERVAL '4 days'),


  -- ── Pinnacle Legal Group (at-risk, low engagement) ──

  ('a4000000-0000-0000-0000-000000000004',
   'Call with Grace Kim — Short call, 15 minutes. Grace said Thomas Reeve (Managing Partner) has not been involved since Q3 and she does not have visibility into whether they plan to renew. Usage data shows only 2 of 12 licensed seats active in the last 30 days. Engagement is very low.',
   NOW() - INTERVAL '10 days'),

  ('a4000000-0000-0000-0000-000000000004',
   'Attempted outreach to Thomas Reeve — Sent email and LinkedIn message, no response in 3 weeks. Thomas was the original champion but appears disengaged. Possible org change or reprioritization internally.',
   NOW() - INTERVAL '20 days'),

  ('a4000000-0000-0000-0000-000000000004',
   'Internal risk note — Pinnacle is $38K ARR, renewal in 6 weeks. Seat utilization at 17%. No exec sponsor active. Recommend a "save" play: schedule a call with Thomas, present a ROI summary, and if no traction offer a seat rightsizing to prevent full churn.',
   NOW() - INTERVAL '5 days'),


  -- ── Vantage Retail Co. (churned) ──

  ('a5000000-0000-0000-0000-000000000005',
   'Final call before churn — Lisa Park confirmed they are not renewing. Primary reason: budget cuts following a company-wide restructuring. Secondary reason: they felt the product was "more than we need right now." No mention of competitor. Ended on a positive note — Lisa said they would revisit in 12–18 months.',
   NOW() - INTERVAL '2 months'),

  ('a5000000-0000-0000-0000-000000000005',
   'Churn post-mortem (internal) — Vantage churned at $29K ARR. Root cause: economic headwinds + product-market fit gap for SMB retail segment. Not a support or quality issue. Tagging account for win-back campaign in Q3 next year.',
   NOW() - INTERVAL '7 weeks'),

  ('a5000000-0000-0000-0000-000000000005',
   'Win-back note — Brian Moss (CTO) connected on LinkedIn and said they are hiring again. Potential signal for reactivation in H2. Flag for outreach in July.',
   NOW() - INTERVAL '1 week');
