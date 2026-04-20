export const MOCK_CRMS = {
  salesforce: {
    label: 'Salesforce',
    tier: 'Enterprise',
    color: '#00A1E0',
    accounts: [
      {
        Id: 'sf-001',
        Name: 'TechCorp Industries',
        Industry: 'Technology',
        AnnualRevenue: 240000,
        ContractEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        HealthScore__c: 3,
        contacts: [
          { FirstName: 'James', LastName: 'Morrison', Title: 'CTO', Email: 'j.morrison@techcorp.com', IsPrimary__c: true },
          { FirstName: 'Lisa', LastName: 'Park', Title: 'VP Engineering', Email: 'l.park@techcorp.com', IsPrimary__c: false },
        ],
        tasks: [
          { Description: 'James escalated API performance issues — third time this quarter. Tone was frustrated. Mentioned evaluating AWS alternative.', ActivityDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { Description: 'SLA breach confirmed for uptime. Legal team CC\'d on last email thread. Renewal in 25 days.', ActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { Description: 'Lisa mentioned their board wants cost reduction of 20% across all vendors before Q3.', ActivityDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        Id: 'sf-002',
        Name: 'GlobalBank Financial',
        Industry: 'Financial Services',
        AnnualRevenue: 180000,
        ContractEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        HealthScore__c: 7,
        contacts: [
          { FirstName: 'Robert', LastName: 'Chen', Title: 'Head of Digital', Email: 'r.chen@globalbank.com', IsPrimary__c: true },
          { FirstName: 'Sarah', LastName: 'Williams', Title: 'Procurement Director', Email: 's.williams@globalbank.com', IsPrimary__c: false },
        ],
        tasks: [
          { Description: 'QBR went well. Robert happy with compliance features. Interested in expanding to 3 more regions.', ActivityDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
          { Description: 'Sarah asked for updated security certification docs — ISO 27001 renewal required before contract expansion.', ActivityDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        Id: 'sf-003',
        Name: 'MedDevice Corp',
        Industry: 'Healthcare',
        AnnualRevenue: 95000,
        ContractEndDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
        HealthScore__c: 9,
        contacts: [
          { FirstName: 'Dr. Amanda', LastName: 'Foster', Title: 'Chief Innovation Officer', Email: 'a.foster@meddevice.com', IsPrimary__c: true },
        ],
        tasks: [
          { Description: 'Amanda referred two sister companies. Wants to co-author a case study. Usage up 40% this quarter.', ActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },

  hubspot: {
    label: 'HubSpot',
    tier: 'Growth',
    color: '#FF7A59',
    accounts: [
      {
        id: 'hs-001',
        properties: {
          name: 'GrowthStack SaaS',
          industry: 'Software',
          annualrevenue: '48000',
          hs_renewal_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          health_score: '2',
        },
        contacts: [
          { properties: { firstname: 'Mike', lastname: 'Torres', jobtitle: 'CEO', email: 'mike@growthstack.io' } },
          { properties: { firstname: 'Jenny', lastname: 'Kim', jobtitle: 'Head of Ops', email: 'jenny@growthstack.io' } },
        ],
        engagements: [
          { engagement: { type: 'NOTE', createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 }, metadata: { body: 'Mike sent a 1-star NPS with comment: onboarding was a disaster. Has not logged in for 3 weeks. Renewal in 15 days.' } },
          { engagement: { type: 'EMAIL', createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 }, metadata: { body: 'Follow-up email sent — no response. Third attempt this month.' } },
        ],
      },
      {
        id: 'hs-002',
        properties: {
          name: 'Bloom Ecommerce',
          industry: 'Retail',
          annualrevenue: '32000',
          hs_renewal_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          health_score: '6',
        },
        contacts: [
          { properties: { firstname: 'Clara', lastname: 'Bloom', jobtitle: 'Founder', email: 'clara@bloomecom.com' } },
        ],
        engagements: [
          { engagement: { type: 'CALL', createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000 }, metadata: { body: 'Clara happy with seasonal campaign results. Wants to explore SMS automation. Budget confirmed for renewal.' } },
        ],
      },
      {
        id: 'hs-003',
        properties: {
          name: 'Launchpad Agency',
          industry: 'Marketing',
          annualrevenue: '28000',
          hs_renewal_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          health_score: '8',
        },
        contacts: [
          { properties: { firstname: 'David', lastname: 'Okafor', jobtitle: 'Managing Director', email: 'david@launchpad.agency' } },
        ],
        engagements: [
          { engagement: { type: 'NOTE', createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000 }, metadata: { body: 'David referred 3 clients this quarter. Wants agency partner program access. Strong expansion candidate.' } },
        ],
      },
    ],
  },

  pipedrive: {
    label: 'Pipedrive',
    tier: 'Startup',
    color: '#172B4D',
    accounts: [
      {
        id: 'pd-001',
        name: 'Quicksell Pro',
        industry: 'Sales Tech',
        deal_value: 18000,
        expected_close_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        health_score: 4,
        contacts: [
          { name: 'Tom Bradley', job_title: 'Sales Director', email: [{ value: 'tom@quicksell.pro' }], primary_flag: true },
        ],
        notes: [
          { content: 'Tom frustrated with reporting module — says competitor has better dashboards. Renewal in 10 days. Needs urgent attention.', add_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        id: 'pd-002',
        name: 'DealFlow Inc',
        industry: 'Finance',
        deal_value: 22000,
        expected_close_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        health_score: 7,
        contacts: [
          { name: 'Rachel Stone', job_title: 'Operations Manager', email: [{ value: 'rachel@dealflow.com' }], primary_flag: true },
        ],
        notes: [
          { content: 'Rachel asked about API access for custom integrations. Team is growing — seat expansion likely next quarter.', add_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        id: 'pd-003',
        name: 'SalesBoost Co',
        industry: 'Consulting',
        deal_value: 15000,
        expected_close_date: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString(),
        health_score: 9,
        contacts: [
          { name: 'Nina Patel', job_title: 'CEO', email: [{ value: 'nina@salesboost.co' }], primary_flag: true },
        ],
        notes: [
          { content: 'Nina gave 10/10 NPS. Wants to record a video testimonial. Introduced us to her network of 50+ consultants.', add_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
    ],
  },
}
