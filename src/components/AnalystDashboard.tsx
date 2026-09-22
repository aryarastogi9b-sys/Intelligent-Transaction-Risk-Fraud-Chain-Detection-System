import React, { useState } from 'react';
import { BankAccount, Transaction, InvestigationCase, MulePatternDetection } from '../types';
import { FraudGraph } from './FraudGraph';
import { AccountInspector } from './AccountInspector';
import { MuleDetectionPanel } from './MuleDetectionPanel';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Unlock, 
  Eye, 
  ArrowUpRight, 
  FileText, 
  PlayCircle,
  HelpCircle,
  Building2,
  RefreshCw
} from 'lucide-react';

interface AnalystDashboardProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  cases: InvestigationCase[];
  muleDetections: MulePatternDetection[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  onOpenCustomerView: (accountId: string) => void;
  onOpenCase: (caseId: string) => void;
  onOpenSimulator: () => void;
  onSelectTransaction: (txId: string) => void;
}

export const AnalystDashboard: React.FC<AnalystDashboardProps> = ({
  accounts,
  transactions,
  cases,
  muleDetections,
  selectedAccountId,
  onSelectAccount,
  onOpenCustomerView,
  onOpenCase,
  onOpenSimulator,
  onSelectTransaction
}) => {
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'isolated' | 'downstream'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Top Metrics matching Page 4 Section 14:
  // Total Transactions: 12,540 + count
  const totalTxCount = 12540 + transactions.length;
  const highRiskCount = transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length + 84;
  const underReviewCount = transactions.filter(t => t.isIsolated || t.status === 'Under Investigation').length + 31;
  const potentialExposuresCount = accounts.filter(a => a.status === 'Potentially Exposed Account').length + 47;
  const fraudChainPatternsCount = muleDetections.length + 12;
  const totalIsolatedVolume = accounts.reduce((sum, a) => sum + a.amountUnderReview, 0);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filterRisk === 'high' && tx.riskLevel !== 'high' && tx.riskLevel !== 'critical') return false;
    if (filterRisk === 'isolated' && !tx.isIsolated) return false;
    if (filterRisk === 'downstream' && tx.status !== 'Potentially Exposed Account') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.senderName.toLowerCase().includes(q) ||
        tx.receiverName.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid (from Proposal Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Total Transactions</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {totalTxCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Live stream + simulated</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-red-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> High &amp; Critical Risk
          </span>
          <div className="text-xl font-bold text-red-400 font-mono mt-1">
            {highRiskCount}
          </div>
          <span className="text-[10px] text-slate-500">Score &gt; 50/100 threshold</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" /> Under Review
          </span>
          <div className="text-xl font-bold text-amber-300 font-mono mt-1">
            {underReviewCount}
          </div>
          <span className="text-[10px] text-slate-500">Active investigation cases</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-sky-400 font-medium flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Potential Exposures
          </span>
          <div className="text-xl font-bold text-sky-300 font-mono mt-1">
            {potentialExposuresCount}
          </div>
          <span className="text-[10px] text-slate-500">Protected downstream entities</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-purple-400 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3" /> Fraud Patterns
          </span>
          <div className="text-xl font-bold text-purple-300 font-mono mt-1">
            {fraudChainPatternsCount}
          </div>
          <span className="text-[10px] text-slate-500">Mule &amp; structuring clusters</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-medium flex items-center gap-1">
            <Unlock className="w-3 h-3" /> Isolated Volume
          </span>
          <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
            ₹{totalIsolatedVolume.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Safe ring-fenced funds</span>
        </div>
      </div>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Graph Canvas */}
        <div className={`${selectedAccount ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Quick Scenarios:</span>
              <button
                id="btn-open-simulator"
                onClick={onOpenSimulator}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 shadow transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                Simulate Scenario / Inject Transfer
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">View Filters:</span>
              <button
                onClick={() => setFilterRisk('all')}
                className={`px-2.5 py-1 rounded-lg ${filterRisk === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRisk('high')}
                className={`px-2.5 py-1 rounded-lg ${filterRisk === 'high' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-slate-400 hover:text-slate-200'}`}
              >
                High Risk
              </button>
              <button
                onClick={() => setFilterRisk('downstream')}
                className={`px-2.5 py-1 rounded-lg ${filterRisk === 'downstream' ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Downstream Protected
              </button>
            </div>
          </div>

          <FraudGraph
            accounts={accounts}
            transactions={transactions}
            selectedAccountId={selectedAccountId}
            onSelectAccount={(accId) => onSelectAccount(accId)}
          />
        </div>

        {/* Selected Node Details Drawer */}
        {selectedAccount && (
          <div className="lg:col-span-4 transition-all duration-300">
            <AccountInspector
              account={selectedAccount}
              transactions={transactions}
              onClose={() => onSelectAccount(null)}
              onOpenCustomerView={onOpenCustomerView}
              onSelectTransaction={onSelectTransaction}
            />
          </div>
        )}
      </div>

      {/* Mule Account Pattern Intelligence */}
      <MuleDetectionPanel
        detections={muleDetections}
        onSelectPattern={(pattern) => {
          if (pattern.involvedAccounts.length > 0) {
            onSelectAccount(pattern.involvedAccounts[0]);
          }
        }}
      />

      {/* Real-time Transactions Queue & Explainability Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Real-time Transaction Audit Stream &amp; Explainable Risk Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Section 6 &amp; 7: Scoring engine, multi-signal attribution, and innocent recipient isolation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tx, party, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">TX ID &amp; Time</th>
                <th className="py-2.5 px-3">Origin Sender</th>
                <th className="py-2.5 px-3">Recipient Account</th>
                <th className="py-2.5 px-3">Amount &amp; Mode</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Ethical Status</th>
                <th className="py-2.5 px-3">Isolation Status</th>
                <th className="py-2.5 px-3 text-right">Case Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.map(tx => {
                const isCritical = tx.riskLevel === 'critical';
                const isHigh = tx.riskLevel === 'high';
                const hasCase = Boolean(tx.investigationCaseId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono">
                      <div className="text-white font-medium">{tx.id}</div>
                      <div className="text-[10px] text-slate-500">{tx.timestamp}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-[140px]">
                        {tx.senderName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.senderId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-medium truncate max-w-[140px]">
                        {tx.receiverName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.receiverId}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.channel}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          isCritical 
                            ? 'bg-red-950 text-red-300 border border-red-800' 
                            : isHigh 
                              ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                              : tx.riskLevel === 'medium'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {tx.riskScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[180px]" title={tx.explainableReason}>
                        {tx.signals.filter(s => s.triggered).map(s => `+${s.points}`).join(' ')}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        tx.status === 'Potentially Exposed Account'
                          ? 'bg-sky-950 text-sky-300 border-sky-800'
                          : tx.status === 'Potential Victim'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : isCritical || isHigh
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {tx.isIsolated ? (
                        <div className="flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                          <Lock className="w-3 h-3" />
                          <span>₹{tx.isolatedAmount.toLocaleString('en-IN')} Held</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <Unlock className="w-3 h-3" />
                          <span>Unrestricted</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {hasCase ? (
                        <button
                          id={`btn-open-case-${tx.investigationCaseId}`}
                          onClick={() => onOpenCase(tx.investigationCaseId!)}
                          className="px-2.5 py-1 rounded bg-sky-900/60 hover:bg-sky-800 text-sky-300 border border-sky-700/60 text-[11px] font-medium flex items-center gap-1 ml-auto transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          Audit Case
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectTransaction(tx.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
