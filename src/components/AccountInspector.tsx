import React from 'react';
import { BankAccount, Transaction, AccountStatus } from '../types';
import { X, ShieldAlert, ShieldCheck, Lock, Unlock, ArrowUpRight, ArrowDownLeft, AlertTriangle, Building2, User, HelpCircle, FileText, ChevronRight } from 'lucide-react';

interface AccountInspectorProps {
  account: BankAccount;
  transactions: Transaction[];
  onClose: () => void;
  onOpenCustomerView: (accountId: string) => void;
  onSelectTransaction: (txId: string) => void;
}

export const AccountInspector: React.FC<AccountInspectorProps> = ({
  account,
  transactions,
  onClose,
  onOpenCustomerView,
  onSelectTransaction
}) => {
  const incomingTxs = transactions.filter(t => t.receiverId === account.id);
  const outgoingTxs = transactions.filter(t => t.senderId === account.id);

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'Potentially Exposed Account':
        return 'bg-sky-900/40 text-sky-300 border-sky-700/60';
      case 'Potential Victim':
        return 'bg-purple-900/40 text-purple-300 border-purple-700/60';
      case 'High Risk':
      case 'Under Investigation':
        return 'bg-red-900/40 text-red-300 border-red-700/60';
      case 'Medium Risk':
        return 'bg-amber-900/40 text-amber-300 border-amber-700/60';
      case 'Low Risk':
      default:
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {account.id}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(account.status)}`}>
              {account.status}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mt-1.5 flex items-center gap-2">
            {account.accountHolder}
          </h3>
          <p className="text-xs text-slate-400">
            {account.type} • Registered: {account.registeredDate} • A/C: {account.accountNumber}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Ethical Principle Banner if Potentially Exposed */}
      {account.status === 'Potentially Exposed Account' && (
        <div className="bg-sky-950/40 border border-sky-800/60 rounded-lg p-3 text-xs text-sky-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-sky-300">Downstream Protection Principle:</span> This account is connected to a money-flow chain from a suspicious origin, but there is <strong>no conclusion of wrongdoing</strong>. Business operations and normal funds are preserved.
          </div>
        </div>
      )}

      {/* Ethical Principle Banner if Potential Victim */}
      {account.status === 'Potential Victim' && (
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-lg p-3 text-xs text-purple-200 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-purple-300">Victim Safeguard:</span> Account holder may have received or handled suspicious funds without apparent knowledge or under coercive pretext. Protected from criminalization.
          </div>
        </div>
      )}

      {/* Section 8: Transaction-Level Risk Isolation Breakdown */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Transaction-Level Risk Containment
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Limit: ₹{account.assuranceLimit.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Total Ledger</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              ₹{account.totalBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-800/40">
            <div className="text-[10px] text-emerald-400 uppercase font-medium">Normal (Usable)</div>
            <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
              ₹{account.normalFunds.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-amber-950/30 p-2.5 rounded border border-amber-800/40">
            <div className="text-[10px] text-amber-400 uppercase font-medium">Under Review</div>
            <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
              ₹{account.amountUnderReview.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          {account.amountUnderReview > 0
            ? `Demonstrating partial isolation: Only ₹${account.amountUnderReview.toLocaleString('en-IN')} is temporarily ring-fenced. The remaining ₹${account.normalFunds.toLocaleString('en-IN')} remains completely unblocked.`
            : 'No funds currently held under review. Full account balance is normal and unrestricted.'}
        </p>
      </div>

      {/* Associated Transactions */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Connected Flows ({incomingTxs.length + outgoingTxs.length})</span>
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {incomingTxs.map(tx => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx.id)}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-medium truncate max-w-[140px]">
                    from {tx.senderName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {tx.timestamp} • {tx.channel}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-300 font-mono font-semibold">
                  +₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  Risk: {tx.riskScore}/100
                </div>
              </div>
            </div>
          ))}

          {outgoingTxs.map(tx => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx.id)}
              className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-medium truncate max-w-[140px]">
                    to {tx.receiverName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {tx.timestamp} • {tx.channel}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-300 font-mono font-semibold">
                  -₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  Risk: {tx.riskScore}/100
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Switch to Customer Experience Button */}
      <button
        id="btn-inspect-customer-view"
        onClick={() => onOpenCustomerView(account.id)}
        className="mt-1 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        View Customer Assurance Portal as this Account
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
