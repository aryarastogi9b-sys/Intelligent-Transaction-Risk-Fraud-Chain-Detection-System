import React, { useState } from 'react';
import { BankAccount, PaymentChannel } from '../types';
import { 
  X, 
  Play, 
  Sparkles, 
  Send, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface TransactionSimulatorModalProps {
  accounts: BankAccount[];
  onClose: () => void;
  onExecutePreset: (presetKey: string) => void;
  onInjectCustomTransaction: (
    senderId: string,
    receiverId: string,
    amount: number,
    channel: PaymentChannel,
    timestamp: string,
    customerRecognized: boolean | null
  ) => void;
}

export const TransactionSimulatorModal: React.FC<TransactionSimulatorModalProps> = ({
  accounts,
  onClose,
  onExecutePreset,
  onInjectCustomTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom Form state
  const [senderId, setSenderId] = useState<string>(accounts[0]?.id || '');
  const [receiverId, setReceiverId] = useState<string>(accounts[2]?.id || '');
  const [amount, setAmount] = useState<number>(45000);
  const [channel, setChannel] = useState<PaymentChannel>('UPI');
  const [timestamp, setTimestamp] = useState<string>('03:15');
  const [customerResponseOption, setCustomerResponseOption] = useState<'pending' | 'recognized' | 'denied'>('pending');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senderId === receiverId) {
      alert('Sender and receiver must be different accounts.');
      return;
    }
    const recognized = customerResponseOption === 'recognized' 
      ? true 
      : customerResponseOption === 'denied' 
        ? false 
        : null;

    onInjectCustomTransaction(
      senderId,
      receiverId,
      amount,
      channel,
      timestamp,
      recognized
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-200 animate-scaleUp my-8">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-bold text-white">Banking Transaction Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate end-to-end scenarios directly from the research proposal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'presets' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Proposal Benchmark Scenarios
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'custom' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Transaction Injector
          </button>
        </div>

        {activeTab === 'presets' ? (
          <div className="space-y-3">
            {/* Scenario 1: Section 17 End-to-End */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-mono border border-sky-800">
                    Section 17
                  </span>
                  ₹80,000 Nocturnal Transfer to Student
                </span>
                <button
                  id="btn-run-scenario-17"
                  onClick={() => {
                    onExecutePreset('scenario_17');
                    onClose();
                  }}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fraudster A sends ₹80,000 at 02:45 AM. Exceeds customer limit (₹25k) → Risk Score 82/100 → Customer notification dispatched → Ring-fences ₹80,000 under review while student retains normal funds.
              </p>
            </div>

            {/* Scenario 2: Section 7 Innocent Business */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
                    Section 7
                  </span>
                  Innocent Merchant &amp; Downstream Supplier
                </span>
                <button
                  id="btn-run-scenario-downstream"
                  onClick={() => {
                    onExecutePreset('scenario_downstream');
                    onClose();
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Account B relays ₹35,000 to Metro Electronics (Business C), which pays ₹20,000 to Supplier D in 18 minutes. Demonstrates labelling as "Potentially Exposed Account" without penalizing innocent business operations.
              </p>
            </div>

            {/* Scenario 3: Section 10 Mule Structuring & Smurfing */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 text-[10px] font-mono border border-purple-800">
                    Section 10
                  </span>
                  Mule Inflow Concentration &amp; Smurfing
                </span>
                <button
                  id="btn-run-scenario-mule"
                  onClick={() => {
                    onExecutePreset('scenario_mule');
                    onClose();
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multiple accounts deposit ₹49,200 &amp; ₹49,500 into Account B within 25 minutes to evade the ₹50,000 CTR/STR ceiling. Flags AML concentration pattern.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sender Entity:</label>
                <select
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountHolder} ({acc.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Receiver Entity:</label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountHolder} ({acc.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Amount (₹):</label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Channel:</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as PaymentChannel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="IMPS">IMPS</option>
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Time (HH:mm):</label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="e.g. 02:45"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Customer Assurance Response:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerResponseOption('pending')}
                  className={`py-1.5 px-2 rounded-lg border text-center ${
                    customerResponseOption === 'pending'
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Pending Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerResponseOption('recognized')}
                  className={`py-1.5 px-2 rounded-lg border text-center ${
                    customerResponseOption === 'recognized'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Recognized
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerResponseOption('denied')}
                  className={`py-1.5 px-2 rounded-lg border text-center ${
                    customerResponseOption === 'denied'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Disputed
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow"
            >
              <Send className="w-4 h-4" />
              Evaluate &amp; Inject Transaction
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
