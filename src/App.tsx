import React, { useState } from 'react';
import { BankAccount, Transaction, InvestigationCase, PaymentChannel } from './types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_CASES } from './data/mockData';
import { evaluateTransactionRisk } from './services/riskEngine';
import { detectMulePatterns } from './services/mlModel';
import { Navbar } from './components/Navbar';
import { AnalystDashboard } from './components/AnalystDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { DatasetLab } from './components/DatasetLab';
import { InvestigationCaseModal } from './components/InvestigationCaseModal';
import { TransactionSimulatorModal } from './components/TransactionSimulatorModal';
import { Scale, ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyst' | 'customer' | 'mllab'>('analyst');
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [cases, setCases] = useState<InvestigationCase[]>(INITIAL_CASES);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [currentCustomerAccountId, setCurrentCustomerAccountId] = useState<string>('ACC-BIZ-C309');

  // Dynamic Mule Detections
  const muleDetections = detectMulePatterns(transactions, accounts);

  // Compute pending customer alerts
  const pendingAlertsCount = transactions.filter(
    t => t.receiverId === currentCustomerAccountId && 
         (t.customerResponse?.status === 'pending' || (t.amount > (accounts.find(a => a.id === currentCustomerAccountId)?.assuranceLimit || 25000) && !t.customerResponse))
  ).length;

  // Handle Assurance Limit Update
  const handleUpdateAssuranceLimit = (accountId: string, newLimit: number) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, assuranceLimit: newLimit };
      }
      return acc;
    }));
  };

  // Handle Customer Verification Response (Section 5 & 9)
  const handleCustomerResponse = (
    txId: string,
    status: 'recognized' | 'unrecognized' | 'reported_suspicious',
    purpose?: string,
    evidenceDoc?: string,
    notes?: string
  ) => {
    // 1. Update Transaction
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        const sender = accounts.find(a => a.id === tx.senderId);
        const receiver = accounts.find(a => a.id === tx.receiverId);
        
        // Re-evaluate risk with customer response
        if (sender && receiver) {
          const evalResult = evaluateTransactionRisk({
            sender,
            receiver,
            amount: tx.amount,
            timestamp: tx.timestamp,
            customerRecognized: status === 'recognized' ? true : false
          });

          return {
            ...tx,
            riskScore: evalResult.riskScore,
            riskLevel: evalResult.riskLevel,
            status: evalResult.status,
            customerResponse: {
              status,
              purpose,
              evidenceUploaded: evidenceDoc,
              notes,
              respondedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
        }
      }
      return tx;
    }));

    // 2. Update case note if case exists
    const targetTx = transactions.find(t => t.id === txId);
    if (targetTx?.investigationCaseId) {
      setCases(prev => prev.map(c => {
        if (c.id === targetTx.investigationCaseId) {
          return {
            ...c,
            notes: [
              ...c.notes,
              `Customer Feedback (${new Date().toLocaleTimeString()}): Verified as "${status}". Declared Purpose: ${purpose || 'None'}. Doc: ${evidenceDoc || 'None'}.`
            ]
          };
        }
        return c;
      }));
    }
  };

  // Handle Spending Normal Funds (Section 8 Verification)
  const handleSimulateNormalFundTransfer = (accountId: string, amount: number, receiverId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newNormal = acc.normalFunds - amount;
        return {
          ...acc,
          normalFunds: newNormal,
          totalBalance: newNormal + acc.amountUnderReview
        };
      }
      if (acc.id === receiverId) {
        const newNormal = acc.normalFunds + amount;
        return {
          ...acc,
          normalFunds: newNormal,
          totalBalance: newNormal + acc.amountUnderReview
        };
      }
      return acc;
    }));

    // Record legitimate transfer transaction
    const sender = accounts.find(a => a.id === accountId)!;
    const receiver = accounts.find(a => a.id === receiverId)!;
    const newTx: Transaction = {
      id: `TXN-NORM-${Date.now().toString().slice(-4)}`,
      senderId: accountId,
      senderName: sender.accountHolder,
      receiverId: receiverId,
      receiverName: receiver.accountHolder,
      amount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'UPI',
      riskScore: 8,
      riskLevel: 'low',
      status: 'Low Risk',
      signals: [],
      explainableReason: 'Executed using liquid unrestricted Normal Funds (demonstrating isolation precision).',
      isIsolated: false,
      isolatedAmount: 0,
      customerAlertSent: false
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Handle Case Updates & Fund Releases
  const handleUpdateCase = (caseId: string, updates: Partial<InvestigationCase>, releaseFundsAmount?: number) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, ...updates } : c));

    if (releaseFundsAmount && releaseFundsAmount > 0) {
      const c = cases.find(item => item.id === caseId);
      if (c) {
        setAccounts(prev => prev.map(acc => {
          if (acc.id === c.primaryAccountId) {
            const newUnderReview = Math.max(0, acc.amountUnderReview - releaseFundsAmount);
            const newNormal = acc.normalFunds + releaseFundsAmount;
            return {
              ...acc,
              amountUnderReview: newUnderReview,
              normalFunds: newNormal,
              totalBalance: newNormal + newUnderReview,
              status: updates.status === 'Cleared (Innocent)' ? 'Low Risk' : acc.status
            };
          }
          return acc;
        }));
      }
    }
  };

  // Handle Benchmark Scenario Presets
  const handleExecutePreset = (presetKey: string) => {
    if (presetKey === 'scenario_17') {
      // Scenario 17: ₹80,000 received by Priya Sharma at 02:45 nocturnal
      const sender = accounts.find(a => a.id === 'ACC-FRD-A101')!;
      const receiver = accounts.find(a => a.id === 'ACC-VIC-E518')!;
      const amount = 80000;

      const evalResult = evaluateTransactionRisk({
        sender,
        receiver,
        amount,
        timestamp: '02:45',
        hopDistanceToSuspicious: 1
      });

      const newTx: Transaction = {
        id: `TXN-S17-${Date.now().toString().slice(-3)}`,
        senderId: sender.id,
        senderName: sender.accountHolder,
        receiverId: receiver.id,
        receiverName: receiver.accountHolder,
        amount,
        timestamp: '02:45',
        channel: 'UPI',
        riskScore: evalResult.riskScore,
        riskLevel: evalResult.riskLevel,
        status: 'Potential Victim',
        signals: evalResult.signals,
        explainableReason: evalResult.explainableReason,
        isIsolated: true,
        isolatedAmount: amount,
        customerAlertSent: true,
        customerResponse: { status: 'pending' },
        investigationCaseId: `CASE-S17-${Date.now().toString().slice(-3)}`
      };

      const newCase: InvestigationCase = {
        id: newTx.investigationCaseId!,
        transactionId: newTx.id,
        primaryAccountId: receiver.id,
        accountHolder: receiver.accountHolder,
        amount,
        riskScore: evalResult.riskScore,
        createdTime: '02:46',
        status: 'Open',
        isolationStatus: 'Active',
        notes: [
          'Scenario 17 trigger: ₹80,000 nocturnal credit exceeding ₹25,000 assurance threshold.',
          'Pushed alert to student customer portal; funds ring-fenced under review.'
        ],
        downstreamAccounts: [],
        findings: 'Potential coercion / scam recipient. Protected under ethical victim mandate.'
      };

      setTransactions(prev => [newTx, ...prev]);
      setCases(prev => [newCase, ...prev]);

      // Update receiver balance
      setAccounts(prev => prev.map(a => {
        if (a.id === receiver.id) {
          return {
            ...a,
            totalBalance: a.totalBalance + amount,
            amountUnderReview: a.amountUnderReview + amount,
            status: 'Potential Victim'
          };
        }
        return a;
      }));

      // Switch to Customer view to see alert!
      setCurrentCustomerAccountId('ACC-VIC-E518');
      setActiveTab('customer');
    } else if (presetKey === 'scenario_downstream') {
      // Scenario 7: Innocent Business B & Supplier C
      setSelectedAccountId('ACC-BIZ-C309');
      setActiveTab('analyst');
    } else if (presetKey === 'scenario_mule') {
      // Scenario 10: Mule Structuring & Concentration
      setSelectedAccountId('ACC-MULE-B204');
      setActiveTab('analyst');
    }
  };

  // Handle Custom Transaction Injection
  const handleInjectCustomTransaction = (
    senderId: string,
    receiverId: string,
    amount: number,
    channel: PaymentChannel,
    timestamp: string,
    customerRecognized: boolean | null
  ) => {
    const sender = accounts.find(a => a.id === senderId);
    const receiver = accounts.find(a => a.id === receiverId);
    if (!sender || !receiver) return;

    const evalResult = evaluateTransactionRisk({
      sender,
      receiver,
      amount,
      timestamp,
      customerRecognized,
      hopDistanceToSuspicious: sender.role === 'suspected_fraudster' ? 1 : 0
    });

    const newTxId = `TXN-${Date.now().toString().slice(-4)}`;
    let caseId: string | undefined = undefined;

    if (evalResult.riskLevel === 'high' || evalResult.riskLevel === 'critical') {
      caseId = `CASE-${Date.now().toString().slice(-4)}`;
      const newCase: InvestigationCase = {
        id: caseId,
        transactionId: newTxId,
        primaryAccountId: receiver.id,
        accountHolder: receiver.accountHolder,
        amount,
        riskScore: evalResult.riskScore,
        createdTime: timestamp,
        status: 'Under Review',
        isolationStatus: 'Active',
        notes: [
          `Auto-flagged with score ${evalResult.riskScore}/100.`,
          evalResult.explainableReason
        ],
        downstreamAccounts: [],
        findings: `Investigating risk indicators. Customer recognized: ${customerRecognized ?? 'Pending confirmation'}`
      };
      setCases(prev => [newCase, ...prev]);
    }

    const newTx: Transaction = {
      id: newTxId,
      senderId,
      senderName: sender.accountHolder,
      receiverId,
      receiverName: receiver.accountHolder,
      amount,
      timestamp,
      channel,
      riskScore: evalResult.riskScore,
      riskLevel: evalResult.riskLevel,
      status: evalResult.status,
      signals: evalResult.signals,
      explainableReason: evalResult.explainableReason,
      isIsolated: evalResult.isIsolated,
      isolatedAmount: evalResult.isolatedAmount,
      customerAlertSent: amount > receiver.assuranceLimit,
      customerResponse: customerRecognized !== null ? {
        status: customerRecognized ? 'recognized' : 'unrecognized'
      } : { status: 'pending' },
      investigationCaseId: caseId
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update account balances
    setAccounts(prev => prev.map(a => {
      if (a.id === receiver.id) {
        const isolatedDelta = evalResult.isIsolated ? amount : 0;
        const normalDelta = evalResult.isIsolated ? 0 : amount;
        return {
          ...a,
          totalBalance: a.totalBalance + amount,
          amountUnderReview: a.amountUnderReview + isolatedDelta,
          normalFunds: a.normalFunds + normalDelta,
          status: evalResult.status
        };
      }
      return a;
    }));

    setSelectedAccountId(receiver.id);
  };

  const activeCase = cases.find(c => c.id === activeCaseId);
  const activeCaseTx = transactions.find(t => t.id === activeCase?.transactionId);
  const currentCustomerAccount = accounts.find(a => a.id === currentCustomerAccountId) || accounts[2];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        pendingAlertsCount={pendingAlertsCount}
      />

      {/* Ethical Protocol Notice Header */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              <strong>Ethical Principle Active (Section 4 &amp; 19):</strong> Distinguishes <em>Potentially Exposed Accounts</em> and <em>Potential Victims</em> from fraudsters. Prevents catastrophic whole-account freeze.
            </span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">
            Academic Research Prototype • B.Tech Computer Science &amp; Data Science
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analyst' && (
          <AnalystDashboard
            accounts={accounts}
            transactions={transactions}
            cases={cases}
            muleDetections={muleDetections}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            onOpenCustomerView={(accId) => {
              setCurrentCustomerAccountId(accId);
              setActiveTab('customer');
            }}
            onOpenCase={(caseId) => setActiveCaseId(caseId)}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onSelectTransaction={(txId) => {
              const tx = transactions.find(t => t.id === txId);
              if (tx?.investigationCaseId) {
                setActiveCaseId(tx.investigationCaseId);
              } else if (tx) {
                setSelectedAccountId(tx.receiverId);
              }
            }}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerPortal
            currentAccount={currentCustomerAccount}
            accounts={accounts}
            transactions={transactions}
            onSwitchAccount={setCurrentCustomerAccountId}
            onUpdateAssuranceLimit={handleUpdateAssuranceLimit}
            onCustomerResponse={handleCustomerResponse}
            onSimulateNormalFundTransfer={handleSimulateNormalFundTransfer}
          />
        )}

        {activeTab === 'mllab' && (
          <DatasetLab
            transactions={transactions}
            accounts={accounts}
          />
        )}
      </main>

      {/* Investigation Case Modal */}
      {activeCase && (
        <InvestigationCaseModal
          investigationCase={activeCase}
          transaction={activeCaseTx}
          accounts={accounts}
          onClose={() => setActiveCaseId(null)}
          onUpdateCase={handleUpdateCase}
        />
      )}

      {/* Transaction Simulator Modal */}
      {isSimulatorOpen && (
        <TransactionSimulatorModal
          accounts={accounts}
          onClose={() => setIsSimulatorOpen(false)}
          onExecutePreset={handleExecutePreset}
          onInjectCustomTransaction={handleInjectCustomTransaction}
        />
      )}
    </div>
  );
}
