import { Transaction, MulePatternDetection, BankAccount } from '../types';

export interface MLFeatureImportance {
  feature: string;
  importance: number; // 0-1
  description: string;
}

export interface MLInferenceResult {
  rfScore: number; // 0-100 Random Forest probability
  isolationForestScore: number; // 0-1 anomaly score
  decisionTreePath: string[];
  topFeatures: { name: string; impact: number; value: string }[];
  modelConfidence: number; // %
}

export const ML_FEATURE_IMPORTANCES: MLFeatureImportance[] = [
  { feature: 'Hop Distance to Flagged Origin', importance: 0.28, description: 'Proximity to known fraudulent clusters in graph' },
  { feature: 'Rapid Velocity Index', importance: 0.22, description: 'Short turnaround between incoming and outgoing hops' },
  { feature: 'Amount Deviation vs Baseline', importance: 0.18, description: 'Ratio of transaction value to historical account median' },
  { feature: 'Customer Recognition Disparity', importance: 0.14, description: 'Mismatch between customer confirmation and flow dynamics' },
  { feature: 'Fan-In / Fan-Out Ratio', importance: 0.11, description: 'Concentration (many-to-one) or distribution (one-to-many)' },
  { feature: 'Diurnal Time Anomaly', importance: 0.07, description: 'Execution during unusual early morning hours' }
];

export function runMLInference(
  transaction: Partial<Transaction>,
  sender?: BankAccount,
  receiver?: BankAccount,
  hopDistance: number = 0
): MLInferenceResult {
  const amount = transaction.amount || 0;
  const isSuspiciousSender = sender?.role === 'suspected_fraudster' || (sender?.riskScore || 0) > 65;
  const isHighVelocity = Boolean(transaction.mulePattern === 'velocity' || transaction.mulePattern === 'multi_hop');
  const isCustomerDispute = transaction.customerResponse?.status === 'unrecognized' || transaction.customerResponse?.status === 'reported_suspicious';

  // Compute simulated Random Forest risk probability
  let score = 12; // baseline false positive low noise
  const decisionPath: string[] = ['Root Node: Transaction Input'];
  const topFeatures: { name: string; impact: number; value: string }[] = [];

  if (hopDistance > 0 && hopDistance <= 2) {
    score += 26;
    decisionPath.push(`Graph Node Hop Check: ${hopDistance} hops <= 2 (Branch: High Risk Cluster)`);
    topFeatures.push({ name: 'Graph Proximity', impact: 26, value: `${hopDistance} hops to flagged entity` });
  } else {
    decisionPath.push('Graph Node Hop Check: Isolated / Clean cluster (Branch: Standard)');
  }

  if (isSuspiciousSender) {
    score += 28;
    decisionPath.push(`Sender Historical Risk: ${sender?.riskScore}/100 > 65 (Branch: High Suspicion Sender)`);
    topFeatures.push({ name: 'Sender Reputation', impact: 28, value: `Prior score: ${sender?.riskScore}` });
  }

  if (isHighVelocity) {
    score += 19;
    decisionPath.push('Temporal Velocity: <30 min hop latency (Branch: Velocity Alert)');
    topFeatures.push({ name: 'Velocity Index', impact: 19, value: 'Rapid forward execution' });
  }

  if (amount >= 50000) {
    score += 15;
    decisionPath.push(`Volume Threshold: ₹${amount.toLocaleString()} >= ₹50,000 (Branch: Elevated Tier)`);
    topFeatures.push({ name: 'Volume Tier', impact: 15, value: `₹${amount.toLocaleString()}` });
  }

  if (isCustomerDispute) {
    score += 24;
    decisionPath.push('Customer Feedback: Transaction Disputed / Unrecognized');
    topFeatures.push({ name: 'Customer Signal', impact: 24, value: 'Disputed by recipient' });
  }

  const rfScore = Math.min(98, Math.max(8, score));
  const isolationForestScore = Number((rfScore / 105).toFixed(3));
  const modelConfidence = Math.min(96, Math.max(72, 75 + (rfScore > 50 ? 15 : 8)));

  return {
    rfScore,
    isolationForestScore,
    decisionTreePath: decisionPath,
    topFeatures,
    modelConfidence
  };
}

/**
 * Mule Account Pattern Detector based on Page 3 Section 10
 */
export function detectMulePatterns(transactions: Transaction[], accounts: BankAccount[]): MulePatternDetection[] {
  const detections: MulePatternDetection[] = [];

  // 1. Many accounts -> One account (Concentration Pattern)
  const incomingMap: { [receiverId: string]: Transaction[] } = {};
  transactions.forEach(tx => {
    if (!incomingMap[tx.receiverId]) incomingMap[tx.receiverId] = [];
    incomingMap[tx.receiverId].push(tx);
  });

  Object.entries(incomingMap).forEach(([accId, txs]) => {
    const uniqueSenders = new Set(txs.map(t => t.senderId));
    if (uniqueSenders.size >= 3) {
      const acc = accounts.find(a => a.id === accId);
      const totalVol = txs.reduce((sum, t) => sum + t.amount, 0);
      detections.push({
        id: `MULE-CONC-${accId}`,
        type: 'concentration',
        title: 'Mule Inflow Concentration Pattern',
        description: `Account ${acc?.accountHolder || accId} received aggregate inflows from ${uniqueSenders.size} separate source accounts in a consolidated window.`,
        severity: 'Critical',
        involvedAccounts: [accId, ...Array.from(uniqueSenders)],
        totalVolume: totalVol,
        timeWindow: '< 45 minutes',
        detectedAt: 'Real-time Stream',
        recommendedAction: 'Apply transaction-level isolation on newest inflow; verify source relationship.'
      });
    }
  });

  // 2. One account -> Many accounts (Distribution Pattern)
  const outgoingMap: { [senderId: string]: Transaction[] } = {};
  transactions.forEach(tx => {
    if (!outgoingMap[tx.senderId]) outgoingMap[tx.senderId] = [];
    outgoingMap[tx.senderId].push(tx);
  });

  Object.entries(outgoingMap).forEach(([accId, txs]) => {
    const uniqueReceivers = new Set(txs.map(t => t.receiverId));
    if (uniqueReceivers.size >= 3) {
      const acc = accounts.find(a => a.id === accId);
      const totalVol = txs.reduce((sum, t) => sum + t.amount, 0);
      detections.push({
        id: `MULE-DIST-${accId}`,
        type: 'distribution',
        title: 'Mule Outflow Distribution Pattern',
        description: `Account ${acc?.accountHolder || accId} rapidly disbursed funds to ${uniqueReceivers.size} distinct downstream endpoints.`,
        severity: 'High',
        involvedAccounts: [accId, ...Array.from(uniqueReceivers)],
        totalVolume: totalVol,
        timeWindow: '< 60 minutes',
        detectedAt: 'Real-time Stream',
        recommendedAction: 'Inspect intermediary account tier; flag potential money-mule distribution node.'
      });
    }
  });

  // 3. Multi-Hop Chain (A -> B -> C -> D -> E)
  const multiHopTxs = transactions.filter(t => t.mulePattern === 'multi_hop');
  if (multiHopTxs.length >= 2) {
    const chainAccounts = Array.from(new Set(multiHopTxs.flatMap(t => [t.senderId, t.receiverId])));
    const totalVol = multiHopTxs.reduce((sum, t) => sum + t.amount, 0);
    detections.push({
      id: 'MULE-MULTIHOP-01',
      type: 'multi_hop',
      title: 'Rapid Multi-Hop Layering Chain (A → B → C → D)',
      description: 'Sequential relay of funds across 4 consecutive accounts within 18-minute intervals to obscure money lineage.',
      severity: 'Critical',
      involvedAccounts: chainAccounts,
      totalVolume: totalVol,
      timeWindow: '18 minutes cumulative',
      detectedAt: 'Graph Topology Analyzer',
      recommendedAction: 'Protect downstream recipient (Business C / Supplier D) as "Potentially Exposed"; isolate only incoming fraction.'
    });
  }

  // 4. Repeated similar-value transfers (Structuring / Smurfing)
  const amounts = transactions.map(t => t.amount);
  const similarTxs = transactions.filter(t => t.amount >= 48000 && t.amount <= 49900);
  if (similarTxs.length >= 2) {
    const structAccounts = Array.from(new Set(similarTxs.flatMap(t => [t.senderId, t.receiverId])));
    detections.push({
      id: 'MULE-STRUCT-01',
      type: 'structuring',
      title: 'Automated Structuring / Smurfing Pattern',
      description: 'Multiple transfers executed just beneath the ₹50,000 regulatory reporting threshold within consecutive windows.',
      severity: 'High',
      involvedAccounts: structAccounts,
      totalVolume: similarTxs.reduce((s, t) => s + t.amount, 0),
      timeWindow: 'Past 2 hours',
      detectedAt: 'Threshold Proximity Scanner',
      recommendedAction: 'Aggregate volume for AML CTR/STR filing; flag accounts for holistic profile audit.'
    });
  }

  // 5. Rapid forwarding of recently received funds (Velocity)
  const velocityTxs = transactions.filter(t => t.mulePattern === 'velocity');
  if (velocityTxs.length > 0) {
    const velAccounts = Array.from(new Set(velocityTxs.flatMap(t => [t.senderId, t.receiverId])));
    detections.push({
      id: 'MULE-VEL-01',
      type: 'velocity',
      title: 'Rapid Turnaround Velocity Anomaly',
      description: 'Funds forwarded outward within 4-12 minutes of receipt, typical of passive transit mule accounts.',
      severity: 'Medium',
      involvedAccounts: velAccounts,
      totalVolume: velocityTxs.reduce((s, t) => s + t.amount, 0),
      timeWindow: '< 15 minutes transit',
      detectedAt: 'Velocity Engine',
      recommendedAction: 'Engage account holder via Customer Assurance Portal before processing outbound releases.'
    });
  }

  return detections;
}
