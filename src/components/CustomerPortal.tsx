import React, { useState } from 'react';
import { BankAccount, Transaction } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Sliders, 
  Bell, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  Clock, 
  HelpCircle,
  Building2,
  User,
  Info
} from 'lucide-react';

interface CustomerPortalProps {
  currentAccount: BankAccount;
  accounts: BankAccount[];
  transactions: Transaction[];
  onSwitchAccount: (accountId: string) => void;
  onUpdateAssuranceLimit: (accountId: string, newLimit: number) => void;
  onCustomerResponse: (
    txId: string,
    status: 'recognized' | 'unrecognized' | 'reported_suspicious',
    purpose?: string,
    evidenceDoc?: string,
    notes?: string
  ) => void;
  onSimulateNormalFundTransfer: (accountId: string, amount: number, receiverId: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentAccount,
  accounts,
  transactions,
  onSwitchAccount,
  onUpdateAssuranceLimit,
  onCustomerResponse,
  onSimulateNormalFundTransfer
}) => {
  const [limitInput, setLimitInput] = useState<number>(currentAccount.assuranceLimit || 25000);
  const [activeTxAlert, setActiveTxAlert] = useState<Transaction | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Business Payment');
  const [evidenceName, setEvidenceName] = useState<string>('Invoice_Restock_2026.pdf');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState<boolean>(false);
  const [testTransferAmount, setTestTransferAmount] = useState<number>(5000);
  const [testTransferSuccess, setTestTransferSuccess] = useState<string | null>(null);

  // Incoming transactions for this account that exceed limit or have pending response
  const pendingAlerts = transactions.filter(
    t => t.receiverId === currentAccount.id && 
         (t.customerResponse?.status === 'pending' || (t.amount > currentAccount.assuranceLimit && !t.customerResponse))
  );

  const myTransactions = transactions.filter(
    t => t.receiverId === currentAccount.id || t.senderId === currentAccount.id
  );

  const handleSaveLimit = () => {
    onUpdateAssuranceLimit(currentAccount.id, limitInput);
  };

  const handleSendResponse = (status: 'recognized' | 'unrecognized' | 'reported_suspicious') => {
    if (!activeTxAlert) return;
    onCustomerResponse(
      activeTxAlert.id,
      status,
      selectedPurpose,
      evidenceName,
      customerNotes
    );
    setActiveTxAlert(null);
  };

  const handleTestNormalTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (testTransferAmount > currentAccount.normalFunds) {
      alert(`Cannot transfer ₹${testTransferAmount}. Normal funds limit is ₹${currentAccount.normalFunds}.`);
      return;
    }
    const receiver = accounts.find(a => a.id !== currentAccount.id) || accounts[0];
    onSimulateNormalFundTransfer(currentAccount.id, testTransferAmount, receiver.id);
    setTestTransferSuccess(`Successfully transferred ₹${testTransferAmount.toLocaleString('en-IN')} using unrestricted Normal Funds!`);
    setIsSimulatingTransfer(false);
    setTimeout(() => setTestTransferSuccess(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Account Switcher Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            {currentAccount.role === 'innocent_business' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">{currentAccount.accountHolder}</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {currentAccount.accountNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Customer Mobile &amp; Internet Banking Portal • Assurance Verification Node
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Switch Account Persona:</span>
          <select
            id="customer-account-select"
            value={currentAccount.id}
            onChange={(e) => onSwitchAccount(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.accountHolder} ({acc.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {testTransferSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-700 rounded-lg p-3 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{testTransferSuccess}</span>
        </div>
      )}

      {/* Top Grid: Transaction-Level Risk Isolation & Assurance Limit */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1: Section 8 Transaction-Level Risk Isolation */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Transaction-Level Risk Isolation</h3>
                <p className="text-xs text-slate-400">Section 8: Selective containment without freezing the whole account</p>
              </div>
            </div>
            <button
              id="btn-simulate-normal-spend"
              onClick={() => setIsSimulatingTransfer(true)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Test Normal Fund Spend
            </button>
          </div>

          {/* Three-part Balance breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-center">
              <span className="text-[11px] text-slate-400 uppercase font-medium">Available Balance</span>
              <div className="text-lg font-bold text-white font-mono mt-1">
                ₹{currentAccount.totalBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400">Total ledger balance</span>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-center">
              <span className="text-[11px] text-emerald-400 uppercase font-medium flex items-center justify-center gap-1">
                <Unlock className="w-3 h-3" /> Normal Funds
              </span>
              <div className="text-lg font-bold text-emerald-300 font-mono mt-1">
                ₹{currentAccount.normalFunds.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-400/80">100% Usable &amp; Liquid</span>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-center">
              <span className="text-[11px] text-amber-400 uppercase font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Under Review
              </span>
              <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                ₹{currentAccount.amountUnderReview.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-400/80">Safely Contained</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p>
                <strong>Academic Prototype Safeguard:</strong> In traditional banking, an account suspected of handling tainted money is often frozen entirely, paralyzing businesses and innocent individuals.
              </p>
              <p className="text-slate-400">
                With <em>Transaction-Level Risk Isolation</em>, only the specific incoming transfer amount under review (₹{currentAccount.amountUnderReview.toLocaleString('en-IN')}) is ring-fenced. Your <strong>₹{currentAccount.normalFunds.toLocaleString('en-IN')}</strong> normal balance remains completely accessible for payroll, vendor payments, and bills.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Section 5 Customer-Configured Assurance Limit */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-800/80 text-sky-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Incoming Payment Assurance Limit</h3>
              <p className="text-xs text-slate-400">Section 5: Customer-configured threshold</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Configured Assurance Threshold:</span>
              <span className="font-mono text-sm font-bold text-sky-400">
                ₹{limitInput.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={limitInput}
              onChange={(e) => setLimitInput(Number(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹5,000</span>
              <span>₹25,000 (Recommended)</span>
              <span>₹50,000</span>
              <span>₹1,00,000</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                id="btn-save-assurance-limit"
                onClick={handleSaveLimit}
                className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow transition-colors"
              >
                Update Personal Assurance Threshold
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              If an incoming payment exceeds <strong>₹{limitInput.toLocaleString('en-IN')}</strong>, the banking system prompts you for verification. <em>Note: Customer approval is treated as one risk signal, not absolute proof, to protect against social engineering.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Section 5 & 9: Pending Incoming Payment Alerts for Customer Confirmation */}
      {pendingAlerts.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/80 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Action Required: Incoming Payment Assurance Confirmation ({pendingAlerts.length})</span>
          </div>

          <div className="space-y-3">
            {pendingAlerts.map(alertTx => (
              <div 
                key={alertTx.id} 
                className="bg-slate-900 border border-amber-800/60 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      EXCEEDS ASSURANCE LIMIT (₹{currentAccount.assuranceLimit.toLocaleString('en-IN')})
                    </span>
                    <span className="text-xs text-slate-400">Received at {alertTx.timestamp}</span>
                  </div>
                  <div className="text-base font-semibold text-white">
                    You have received <span className="font-mono text-emerald-400">₹{alertTx.amount.toLocaleString('en-IN')}</span> from <span className="text-sky-300">{alertTx.senderName}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    "This transaction exceeds your configured assurance limit of ₹{currentAccount.assuranceLimit.toLocaleString('en-IN')}. Please confirm whether you recognize this payment and specify the legitimate purpose."
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`btn-respond-alert-${alertTx.id}`}
                    onClick={() => setActiveTxAlert(alertTx)}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Review &amp; Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Verification & Response Modal */}
      {activeTxAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp text-slate-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
                  Section 5 &amp; 9 Verification Dialog
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Confirm Incoming Transfer: ₹{activeTxAlert.amount.toLocaleString('en-IN')}
                </h3>
              </div>
              <button
                onClick={() => setActiveTxAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Sender:</span>
                <span className="text-slate-200 font-medium">{activeTxAlert.senderName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Channel:</span>
                <span className="text-slate-200 font-medium">{activeTxAlert.channel}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Under Review:</span>
                <span className="text-amber-300 font-mono font-bold">₹{activeTxAlert.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Purpose Selection (Section 9) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Transaction Purpose (Section 9):
              </label>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Salary">Salary</option>
                <option value="Business Payment">Business Payment</option>
                <option value="Sale of Goods">Sale of Goods</option>
                <option value="Service Payment">Service Payment</option>
                <option value="Loan Repayment">Loan Repayment</option>
                <option value="Family/Friend Transfer">Family/Friend Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Evidence Document (Section 9) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Supporting Document / Evidence (Invoices, Receipts):</span>
                <span className="text-[10px] text-slate-400">Risk-based</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  placeholder="e.g. GST_Invoice_8921.pdf"
                  className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => setEvidenceName(`Invoice_${Date.now().toString().slice(-4)}.pdf`)}
                  className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Doc
                </button>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Additional Clarification / Notes:
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Verified customer walk-in invoice settlement."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                id="btn-customer-recognize"
                onClick={() => handleSendResponse('recognized')}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                I Recognize This Payment &amp; Provide Purpose
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-customer-not-recognize"
                  onClick={() => handleSendResponse('unrecognized')}
                  className="py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  I Do Not Recognize
                </button>

                <button
                  id="btn-customer-report"
                  onClick={() => handleSendResponse('reported_suspicious')}
                  className="py-2 px-3 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Report Suspicious
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Normal Fund Transfer Dialog */}
      {isSimulatingTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleTestNormalTransfer} className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Demonstrate Transaction-Level Isolation</h3>
                <p className="text-xs text-slate-400">Transfer funds from unrestricted Normal Funds</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatingTransfer(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Unrestricted Normal Funds:</span>
                <span className="text-emerald-400 font-bold font-mono">₹{currentAccount.normalFunds.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Under Review (Protected):</span>
                <span className="text-amber-400 font-mono">₹{currentAccount.amountUnderReview.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold">Transfer Amount (₹):</label>
              <input
                type="number"
                max={currentAccount.normalFunds}
                value={testTransferAmount}
                onChange={(e) => setTestTransferAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 font-mono"
              />
              <span className="text-[11px] text-slate-400">Max allowed from Normal Funds: ₹{currentAccount.normalFunds.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              Execute Transfer From Normal Funds
            </button>
          </form>
        </div>
      )}

      {/* Account Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center justify-between">
          <span>Account Transaction Activity</span>
          <span className="text-xs text-slate-400 font-normal">{myTransactions.length} Total Records</span>
        </h3>

        <div className="divide-y divide-slate-800">
          {myTransactions.map(tx => {
            const isIncoming = tx.receiverId === currentAccount.id;
            return (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isIncoming ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'}`}>
                    {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {isIncoming ? `Received from ${tx.senderName}` : `Paid to ${tx.receiverName}`}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {tx.id} • {tx.timestamp} • {tx.channel}
                    </div>
                    {tx.customerResponse && (
                      <div className="text-[10px] text-sky-400 mt-0.5">
                        Response: {tx.customerResponse.status} • {tx.customerResponse.purpose || 'No purpose recorded'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-sm ${isIncoming ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {isIncoming ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  {tx.isIsolated && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/80">
                      Isolated Under Review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
