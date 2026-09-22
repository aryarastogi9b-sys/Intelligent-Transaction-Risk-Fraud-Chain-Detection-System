export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AccountStatus = 
  | 'Low Risk'
  | 'Medium Risk'
  | 'High Risk'
  | 'Potentially Exposed Account'
  | 'Potential Victim'
  | 'Under Investigation';

export type AccountRole = 
  | 'suspected_fraudster'
  | 'mule_intermediary'
  | 'innocent_business'
  | 'downstream_supplier'
  | 'potential_victim'
  | 'regular_customer';

export type PaymentChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CARDS';

export interface BankAccount {
  id: string;
  accountNumber: string;
  accountHolder: string;
  role: AccountRole;
  status: AccountStatus;
  totalBalance: number;
  amountUnderReview: number;
  normalFunds: number; // totalBalance - amountUnderReview
  assuranceLimit: number;
  phone: string;
  riskScore: number;
  registeredDate: string;
  type: 'Personal' | 'Current / Business' | 'Merchant';
}

export interface RiskSignalResult {
  code: string;
  name: string;
  points: number;
  triggered: boolean;
  explanation: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  timestamp: string; // ISO or formatted HH:mm
  channel: PaymentChannel;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AccountStatus;
  signals: RiskSignalResult[];
  explainableReason: string;
  isIsolated: boolean;
  isolatedAmount: number;
  customerAlertSent: boolean;
  customerResponse?: {
    status: 'recognized' | 'unrecognized' | 'reported_suspicious' | 'pending';
    purpose?: string;
    evidenceUploaded?: string;
    notes?: string;
    respondedAt?: string;
  };
  mulePattern?: 'concentration' | 'distribution' | 'multi_hop' | 'structuring' | 'velocity';
  investigationCaseId?: string;
}

export interface InvestigationCase {
  id: string;
  transactionId: string;
  primaryAccountId: string;
  accountHolder: string;
  amount: number;
  riskScore: number;
  createdTime: string;
  status: 'Open' | 'Under Review' | 'Cleared (Innocent)' | 'Escalated to FIU' | 'Restricted';
  isolationStatus: 'Active' | 'Partially Released' | 'Full Released';
  notes: string[];
  evidenceDoc?: string;
  downstreamAccounts: string[];
  findings: string;
}

export interface GraphNode {
  id: string;
  label: string;
  role: AccountRole;
  status: AccountStatus;
  riskScore: number;
  totalBalance: number;
  amountUnderReview: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  timestamp: string;
  channel: PaymentChannel;
  riskLevel: RiskLevel;
  riskScore: number;
  isRecentVelocity?: boolean;
}

export interface MulePatternDetection {
  id: string;
  type: 'concentration' | 'distribution' | 'multi_hop' | 'structuring' | 'velocity';
  title: string;
  description: string;
  severity: 'Medium' | 'High' | 'Critical';
  involvedAccounts: string[];
  totalVolume: number;
  timeWindow: string;
  detectedAt: string;
  recommendedAction: string;
}
