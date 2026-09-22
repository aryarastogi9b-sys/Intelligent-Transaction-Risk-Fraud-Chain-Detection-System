import { BankAccount, Transaction, InvestigationCase } from '../types';

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'ACC-FRD-A101',
    accountNumber: '•••• 9101',
    accountHolder: 'Fraudster A (Unknown Syndicated Source)',
    role: 'suspected_fraudster',
    status: 'Under Investigation',
    totalBalance: 15400,
    amountUnderReview: 0,
    normalFunds: 15400,
    assuranceLimit: 10000,
    phone: '+91 98765 00001',
    riskScore: 92,
    registeredDate: '2026-01-14',
    type: 'Personal'
  },
  {
    id: 'ACC-MULE-B204',
    accountNumber: '•••• 4204',
    accountHolder: 'Account B (Rapid Intermediary Relay)',
    role: 'mule_intermediary',
    status: 'High Risk',
    totalBalance: 32000,
    amountUnderReview: 30000,
    normalFunds: 2000,
    assuranceLimit: 25000,
    phone: '+91 98765 00002',
    riskScore: 78,
    registeredDate: '2025-11-20',
    type: 'Personal'
  },
  {
    id: 'ACC-BIZ-C309',
    accountNumber: '•••• 3309',
    accountHolder: 'Business C (Metro Electronics & Retail)',
    role: 'innocent_business',
    status: 'Potentially Exposed Account',
    // Exact figure from Proposal Section 8:
    // Available Balance: 1,20,000 | Normal Funds: 80,000 | Amount Under Review: 40,000
    totalBalance: 120000,
    amountUnderReview: 40000,
    normalFunds: 80000,
    assuranceLimit: 25000,
    phone: '+91 98765 00003',
    riskScore: 42,
    registeredDate: '2022-04-10',
    type: 'Current / Business'
  },
  {
    id: 'ACC-SUP-D412',
    accountNumber: '•••• 7412',
    accountHolder: 'Account D (Apex Hardware & Component Supplier)',
    role: 'downstream_supplier',
    status: 'Potentially Exposed Account',
    totalBalance: 85000,
    amountUnderReview: 20000,
    normalFunds: 65000,
    assuranceLimit: 30000,
    phone: '+91 98765 00004',
    riskScore: 28,
    registeredDate: '2021-08-19',
    type: 'Current / Business'
  },
  {
    id: 'ACC-VIC-E518',
    accountNumber: '•••• 8518',
    accountHolder: 'Priya Sharma (Student / Potential Victim)',
    role: 'potential_victim',
    status: 'Potential Victim',
    totalBalance: 84000,
    amountUnderReview: 80000,
    normalFunds: 4000,
    assuranceLimit: 25000, // Configured assurance limit from proposal
    phone: '+91 98765 00005',
    riskScore: 82,
    registeredDate: '2025-02-11',
    type: 'Personal'
  },
  {
    id: 'ACC-REG-F620',
    accountNumber: '•••• 1620',
    accountHolder: 'Vikramaditya Rao (Enterprise Consultant)',
    role: 'regular_customer',
    status: 'Low Risk',
    totalBalance: 245000,
    amountUnderReview: 0,
    normalFunds: 245000,
    assuranceLimit: 50000,
    phone: '+91 98765 00006',
    riskScore: 12,
    registeredDate: '2019-06-03',
    type: 'Personal'
  },
  {
    id: 'ACC-SRC-G701',
    accountNumber: '•••• 2701',
    accountHolder: 'K. Patel (Inflow Feeder 1)',
    role: 'mule_intermediary',
    status: 'Medium Risk',
    totalBalance: 52000,
    amountUnderReview: 0,
    normalFunds: 52000,
    assuranceLimit: 20000,
    phone: '+91 98765 00007',
    riskScore: 48,
    registeredDate: '2025-10-05',
    type: 'Personal'
  },
  {
    id: 'ACC-SRC-G702',
    accountNumber: '•••• 6702',
    accountHolder: 'S. Verma (Inflow Feeder 2)',
    role: 'mule_intermediary',
    status: 'Medium Risk',
    totalBalance: 49000,
    amountUnderReview: 0,
    normalFunds: 49000,
    assuranceLimit: 20000,
    phone: '+91 98765 00008',
    riskScore: 50,
    registeredDate: '2025-12-01',
    type: 'Personal'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    senderId: 'ACC-FRD-A101',
    senderName: 'Fraudster A (Unknown Syndicated Source)',
    receiverId: 'ACC-MULE-B204',
    receiverName: 'Account B (Rapid Intermediary Relay)',
    amount: 50000,
    timestamp: '10:30',
    channel: 'UPI',
    riskScore: 88,
    riskLevel: 'critical',
    status: 'Under Investigation',
    signals: [
      { code: 'SIG_SENDER_SUSPICIOUS', name: 'Sender already marked suspicious', points: 30, triggered: true, explanation: 'Sender flagged in consortium threat intelligence feeds' },
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: true, explanation: 'Volume exceeds 95th percentile for new account' },
      { code: 'SIG_NEW_SENDER', name: 'New or unfamiliar sender', points: 10, triggered: true, explanation: 'First touchpoint between entities' },
      { code: 'SIG_CONNECTED_SUSPICIOUS', name: 'Connection to known suspicious account', points: 30, triggered: true, explanation: 'Originates from known syndication node' }
    ],
    explainableReason: 'Flagged with 88/100 score: Suspicious sender history (+30), high atypical volume (+20), new sender pair (+10), direct fraudulent cluster adjacency (+30).',
    isIsolated: true,
    isolatedAmount: 50000,
    customerAlertSent: true,
    mulePattern: 'multi_hop',
    investigationCaseId: 'CASE-2026-001'
  },
  {
    id: 'TXN-002',
    senderId: 'ACC-MULE-B204',
    senderName: 'Account B (Rapid Intermediary Relay)',
    receiverId: 'ACC-BIZ-C309',
    receiverName: 'Business C (Metro Electronics & Retail)',
    amount: 35000,
    timestamp: '10:42',
    channel: 'UPI',
    riskScore: 65,
    riskLevel: 'high',
    status: 'Potentially Exposed Account',
    signals: [
      { code: 'SIG_RAPID_TRANSFERS', name: 'Multiple rapid transfers', points: 20, triggered: true, explanation: 'Transferred 12 minutes after receiving ₹50,000 from Fraudster A' },
      { code: 'SIG_CONNECTED_SUSPICIOUS', name: 'Connection to known suspicious account', points: 30, triggered: true, explanation: '1-hop downstream relay from Fraudster A' },
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: false, explanation: 'Amount fits typical merchant order ticket' }
    ],
    explainableReason: 'Innocent downstream merchant protection: Business C received ₹35,000 within 12 minutes of upstream tainted inflow. Classified as Potentially Exposed Account without accusatory sanctions.',
    isIsolated: true,
    isolatedAmount: 35000,
    customerAlertSent: true,
    customerResponse: {
      status: 'recognized',
      purpose: 'Sale of Goods (Customer POS terminal purchase)',
      evidenceUploaded: 'GST_Invoice_METRO_8921.pdf',
      notes: 'Customer walked in and purchased graphics card & power supply over counter.',
      respondedAt: '10:55'
    },
    mulePattern: 'velocity',
    investigationCaseId: 'CASE-2026-002'
  },
  {
    id: 'TXN-003',
    senderId: 'ACC-BIZ-C309',
    senderName: 'Business C (Metro Electronics & Retail)',
    receiverId: 'ACC-SUP-D412',
    receiverName: 'Account D (Apex Hardware & Component Supplier)',
    amount: 20000,
    timestamp: '10:51',
    channel: 'IMPS',
    riskScore: 34,
    riskLevel: 'medium',
    status: 'Potentially Exposed Account',
    signals: [
      { code: 'SIG_RAPID_TRANSFERS', name: 'Multiple rapid transfers', points: 20, triggered: true, explanation: 'Dispatched to supplier within 9 minutes of merchant receipt' },
      { code: 'SIG_CONNECTED_SUSPICIOUS', name: 'Connection to known suspicious account', points: 30, triggered: false, explanation: '2 hops removed from original source; verified commercial vendor' }
    ],
    explainableReason: 'Legitimate B2B inventory restocking payment. Account D marked as Potentially Exposed; legitimate trade funds safeguarded.',
    isIsolated: false,
    isolatedAmount: 0,
    customerAlertSent: false,
    mulePattern: 'multi_hop'
  },
  {
    id: 'TXN-004',
    senderId: 'ACC-FRD-A101',
    senderName: 'Fraudster A (Unknown Syndicated Source)',
    receiverId: 'ACC-VIC-E518',
    receiverName: 'Priya Sharma (Student / Potential Victim)',
    amount: 80000,
    timestamp: '02:45',
    channel: 'UPI',
    riskScore: 82,
    riskLevel: 'critical',
    status: 'Potential Victim',
    signals: [
      { code: 'SIG_SENDER_SUSPICIOUS', name: 'Sender already marked suspicious', points: 30, triggered: true, explanation: 'Sender is active in fraud ring' },
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: true, explanation: 'Exceeds customer configured assurance limit (₹25,000)' },
      { code: 'SIG_UNUSUAL_TIME', name: 'Unusual transaction time', points: 5, triggered: true, explanation: '02:45 AM nocturnal delivery' },
      { code: 'SIG_CONNECTED_SUSPICIOUS', name: 'Connection to known suspicious account', points: 30, triggered: true, explanation: 'Direct transfer from fraudster' }
    ],
    explainableReason: 'High-risk transfer (₹80,000) at 02:45 AM exceeding configured assurance limit of ₹25,000. Customer flagged as Potential Victim to avoid coercive mule entrapment.',
    isIsolated: true,
    isolatedAmount: 80000,
    customerAlertSent: true,
    customerResponse: {
      status: 'pending'
    },
    investigationCaseId: 'CASE-2026-004'
  },
  {
    id: 'TXN-005',
    senderId: 'ACC-SRC-G701',
    senderName: 'K. Patel (Inflow Feeder 1)',
    receiverId: 'ACC-MULE-B204',
    receiverName: 'Account B (Rapid Intermediary Relay)',
    amount: 49200,
    timestamp: '09:15',
    channel: 'UPI',
    riskScore: 58,
    riskLevel: 'high',
    status: 'Medium Risk',
    signals: [
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: true, explanation: 'Structured transfer ₹49,200 just beneath ₹50,000 reporting threshold' }
    ],
    explainableReason: 'Smurfing pattern: structured just below regulatory reporting trigger.',
    isIsolated: false,
    isolatedAmount: 0,
    customerAlertSent: false,
    mulePattern: 'structuring'
  },
  {
    id: 'TXN-006',
    senderId: 'ACC-SRC-G702',
    senderName: 'S. Verma (Inflow Feeder 2)',
    receiverId: 'ACC-MULE-B204',
    receiverName: 'Account B (Rapid Intermediary Relay)',
    amount: 49500,
    timestamp: '09:40',
    channel: 'UPI',
    riskScore: 61,
    riskLevel: 'high',
    status: 'High Risk',
    signals: [
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: true, explanation: 'Structured transfer ₹49,500 just beneath ₹50,000 threshold' },
      { code: 'SIG_RAPID_TRANSFERS', name: 'Multiple rapid transfers', points: 20, triggered: true, explanation: 'Second structured deposit into Account B within 25 minutes' }
    ],
    explainableReason: 'Concentration mule behavior: multiple accounts depositing near ₹50,000 into Account B.',
    isIsolated: true,
    isolatedAmount: 49500,
    customerAlertSent: true,
    mulePattern: 'concentration'
  },
  {
    id: 'TXN-007',
    senderId: 'ACC-REG-F620',
    senderName: 'Vikramaditya Rao (Enterprise Consultant)',
    receiverId: 'ACC-BIZ-C309',
    receiverName: 'Business C (Metro Electronics & Retail)',
    amount: 14500,
    timestamp: '14:20',
    channel: 'NEFT',
    riskScore: 12,
    riskLevel: 'low',
    status: 'Low Risk',
    signals: [
      { code: 'SIG_SENDER_SUSPICIOUS', name: 'Sender already marked suspicious', points: 30, triggered: false, explanation: 'Clean KYC profile' },
      { code: 'SIG_UNUSUAL_AMOUNT', name: 'Unusual transaction amount', points: 20, triggered: false, explanation: 'Normal invoice settlement' }
    ],
    explainableReason: 'Standard commercial electronic fund transfer with verified parties.',
    isIsolated: false,
    isolatedAmount: 0,
    customerAlertSent: false
  }
];

export const INITIAL_CASES: InvestigationCase[] = [
  {
    id: 'CASE-2026-001',
    transactionId: 'TXN-001',
    primaryAccountId: 'ACC-MULE-B204',
    accountHolder: 'Account B (Rapid Intermediary Relay)',
    amount: 50000,
    riskScore: 88,
    createdTime: '10:32',
    status: 'Under Review',
    isolationStatus: 'Active',
    notes: [
      'Originates from known syndicated phishing address.',
      'Account B attempted instant forward relay to Metro Electronics (Business C).',
      'Account balance isolated for ₹30,000 remainder.'
    ],
    downstreamAccounts: ['ACC-BIZ-C309', 'ACC-SUP-D412'],
    findings: 'Intermediary account exhibiting classic mule layering mechanics. Downstream entities protected.'
  },
  {
    id: 'CASE-2026-002',
    transactionId: 'TXN-002',
    primaryAccountId: 'ACC-BIZ-C309',
    accountHolder: 'Business C (Metro Electronics & Retail)',
    amount: 35000,
    riskScore: 65,
    createdTime: '10:45',
    status: 'Under Review',
    isolationStatus: 'Active',
    notes: [
      'Account identified as downstream recipient of tainted funds.',
      'Merchant submitted valid GST invoice (METRO_8921.pdf).',
      'Normal operational funds (₹80,000) remain 100% accessible to merchant.'
    ],
    evidenceDoc: 'GST_Invoice_METRO_8921.pdf',
    downstreamAccounts: ['ACC-SUP-D412'],
    findings: 'Potentially Exposed innocent business entity. Transaction-level containment prevents business disruption while origin is audited.'
  },
  {
    id: 'CASE-2026-004',
    transactionId: 'TXN-004',
    primaryAccountId: 'ACC-VIC-E518',
    accountHolder: 'Priya Sharma (Student / Potential Victim)',
    amount: 80000,
    riskScore: 82,
    createdTime: '02:46',
    status: 'Open',
    isolationStatus: 'Active',
    notes: [
      'Nocturnal high-value incoming credit (₹80,000).',
      'Exceeded customer assurance limit (₹25,000).',
      'Real-time alert pushed to mobile portal; awaiting student acknowledgment.',
      'Target funds isolated to protect student from criminal liability.'
    ],
    downstreamAccounts: [],
    findings: 'Candidate for Job Offer / Task Scam victim mule. Isolation preserves funds without criminalizing the account holder.'
  }
];
