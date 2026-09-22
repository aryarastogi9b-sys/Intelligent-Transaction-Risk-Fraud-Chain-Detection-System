import { BankAccount, RiskSignalResult, RiskLevel, AccountStatus, Transaction } from '../types';

export interface ScoreEvaluationInput {
  sender: BankAccount;
  receiver: BankAccount;
  amount: number;
  timestamp: string; // e.g. "02:45" or "10:30"
  hasRecentRapidTransfers?: boolean;
  hopDistanceToSuspicious?: number; // 0 = self, 1 = 1 hop away, 2 = 2 hops away, >2 = distant
  customerRecognized?: boolean | null; // null = pending, true = recognized, false = denied
}

export function evaluateTransactionRisk(input: ScoreEvaluationInput): {
  riskScore: number;
  riskLevel: RiskLevel;
  status: AccountStatus;
  signals: RiskSignalResult[];
  explainableReason: string;
  isIsolated: boolean;
  isolatedAmount: number;
} {
  const { sender, receiver, amount, timestamp, hasRecentRapidTransfers, hopDistanceToSuspicious, customerRecognized } = input;

  const signals: RiskSignalResult[] = [];
  let rawScore = 0;

  // Signal 1: Sender already marked suspicious (+30)
  const isSenderSuspicious = sender.role === 'suspected_fraudster' || sender.riskScore >= 70;
  signals.push({
    code: 'SIG_SENDER_SUSPICIOUS',
    name: 'Sender already marked suspicious',
    points: 30,
    triggered: isSenderSuspicious,
    explanation: isSenderSuspicious 
      ? `Originating account (${sender.accountHolder}) holds high historical risk score (${sender.riskScore}/100)`
      : 'Sender profile shows clean historical compliance record'
  });
  if (isSenderSuspicious) rawScore += 30;

  // Signal 2: Unusual transaction amount (+20)
  // E.g., amount > 50,000 or > 3x receiver's typical volume
  const isUnusualAmount = amount >= 45000 || (receiver.assuranceLimit > 0 && amount > receiver.assuranceLimit * 1.5);
  signals.push({
    code: 'SIG_UNUSUAL_AMOUNT',
    name: 'Unusual transaction amount',
    points: 20,
    triggered: isUnusualAmount,
    explanation: isUnusualAmount 
      ? `Transaction volume (₹${amount.toLocaleString('en-IN')}) significantly deviates from historical baseline for this account`
      : 'Amount conforms to expected profile volume'
  });
  if (isUnusualAmount) rawScore += 20;

  // Signal 3: New or unfamiliar sender (+10)
  const isNewSender = sender.registeredDate.includes('2026') || sender.id.includes('new');
  signals.push({
    code: 'SIG_NEW_SENDER',
    name: 'New or unfamiliar sender',
    points: 10,
    triggered: isNewSender,
    explanation: isNewSender 
      ? `First-time counterparty relationship; no prior transaction history between ${sender.accountHolder} and ${receiver.accountHolder}`
      : 'Established counterparty relationship with prior successful transfers'
  });
  if (isNewSender) rawScore += 10;

  // Signal 4: Unusual transaction time (+5)
  // E.g. late night 01:00 to 05:30
  let isUnusualTime = false;
  if (timestamp) {
    const hour = parseInt(timestamp.split(':')[0], 10);
    if (!isNaN(hour) && (hour >= 1 && hour <= 5)) {
      isUnusualTime = true;
    }
  }
  signals.push({
    code: 'SIG_UNUSUAL_TIME',
    name: 'Unusual transaction time',
    points: 5,
    triggered: isUnusualTime,
    explanation: isUnusualTime 
      ? `Initiated outside normal diurnal operating hours (${timestamp} hrs off-peak nocturnal window)`
      : `Initiated during standard financial window (${timestamp || 'daytime'})`
  });
  if (isUnusualTime) rawScore += 5;

  // Signal 5: Multiple rapid transfers (+20)
  const isVelocitySpike = Boolean(hasRecentRapidTransfers);
  signals.push({
    code: 'SIG_RAPID_TRANSFERS',
    name: 'Multiple rapid transfers',
    points: 20,
    triggered: isVelocitySpike,
    explanation: isVelocitySpike 
      ? 'High velocity flow: multiple outgoing/incoming hops completed in rapid succession (<30 min window)'
      : 'Transfer pacing aligns with expected natural human transaction velocity'
  });
  if (isVelocitySpike) rawScore += 20;

  // Signal 6: Connection to known suspicious account (+30)
  const isConnectedToSuspicious = typeof hopDistanceToSuspicious === 'number' && hopDistanceToSuspicious <= 2 && hopDistanceToSuspicious > 0;
  signals.push({
    code: 'SIG_CONNECTED_SUSPICIOUS',
    name: 'Connection to known suspicious account',
    points: 30,
    triggered: isConnectedToSuspicious,
    explanation: isConnectedToSuspicious 
      ? `Fraud-money graph traversal identified a ${hopDistanceToSuspicious}-hop path from blacklisted source node`
      : 'No topological proximity to blacklisted or under-investigation clusters'
  });
  if (isConnectedToSuspicious) rawScore += 30;

  // Signal 7: Customer does not recognize payment (+40)
  const customerDenied = customerRecognized === false;
  signals.push({
    code: 'SIG_CUSTOMER_DENIED',
    name: 'Customer does not recognize payment',
    points: 40,
    triggered: customerDenied,
    explanation: customerDenied 
      ? 'Customer explicitly indicated non-recognition / disputed legitimate source of incoming funds'
      : customerRecognized === true 
        ? 'Customer authenticated and affirmed familiarity with counterparty (mitigating risk signal)'
        : 'Awaiting customer threshold response'
  });
  if (customerDenied) rawScore += 40;

  // If customer confirmed, apply risk mitigation discount (-15 points)
  if (customerRecognized === true && rawScore > 15) {
    rawScore -= 15;
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(5, rawScore));

  // Determine Risk Level
  let riskLevel: RiskLevel = 'low';
  if (finalScore >= 76) riskLevel = 'critical';
  else if (finalScore >= 51) riskLevel = 'high';
  else if (finalScore >= 26) riskLevel = 'medium';
  else riskLevel = 'low';

  // Determine Status adhering strictly to Ethical Mandate:
  // "Do Not Automatically Label Everyone as a Criminal"
  let status: AccountStatus = 'Low Risk';
  if (riskLevel === 'critical') {
    if (receiver.role === 'innocent_business' || receiver.role === 'downstream_supplier') {
      status = 'Potentially Exposed Account';
    } else if (receiver.role === 'potential_victim') {
      status = 'Potential Victim';
    } else {
      status = 'Under Investigation';
    }
  } else if (riskLevel === 'high') {
    if (receiver.role === 'innocent_business' || receiver.role === 'downstream_supplier') {
      status = 'Potentially Exposed Account';
    } else if (receiver.role === 'potential_victim') {
      status = 'Potential Victim';
    } else {
      status = 'High Risk';
    }
  } else if (riskLevel === 'medium') {
    status = 'Medium Risk';
  } else {
    status = 'Low Risk';
  }

  // Transaction-level Risk Isolation:
  // If High or Critical, only isolate this specific transaction amount!
  const isIsolated = riskLevel === 'high' || riskLevel === 'critical';
  const isolatedAmount = isIsolated ? amount : 0;

  // Generate Explainable Reason
  const triggeredSignals = signals.filter(s => s.triggered);
  let explainableReason = '';
  if (triggeredSignals.length === 0) {
    explainableReason = 'Transaction parameters adhere to baseline legitimate banking patterns.';
  } else {
    explainableReason = `Flagged with ${finalScore}/100 score based on ${triggeredSignals.length} risk factor${triggeredSignals.length > 1 ? 's' : ''}: ` +
      triggeredSignals.map(s => `${s.name} (+${s.points})`).join(', ') + '.';
  }

  return {
    riskScore: finalScore,
    riskLevel,
    status,
    signals,
    explainableReason,
    isIsolated,
    isolatedAmount
  };
}
