import React, { useState } from 'react';
import { InvestigationCase, Transaction, BankAccount } from '../types';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ExternalLink, 
  UserCheck, 
  Scale, 
  Clock, 
  Send 
} from 'lucide-react';

interface InvestigationCaseModalProps {
  investigationCase: InvestigationCase;
  transaction?: Transaction;
  accounts: BankAccount[];
  onClose: () => void;
  onUpdateCase: (caseId: string, updates: Partial<InvestigationCase>, releaseFundsAmount?: number) => void;
}

export const InvestigationCaseModal: React.FC<InvestigationCaseModalProps> = ({
  investigationCase,
  transaction,
  accounts,
  onClose,
  onUpdateCase
}) => {
  const [newNote, setNewNote] = useState('');
  const primaryAccount = accounts.find(a => a.id === investigationCase.primaryAccountId);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updatedNotes = [...investigationCase.notes, `Analyst Note (${new Date().toLocaleTimeString()}): ${newNote.trim()}`];
    onUpdateCase(investigationCase.id, { notes: updatedNotes });
    setNewNote('');
  };

  const handleReleaseFunds = () => {
    // Release isolated funds and mark as Cleared
    onUpdateCase(
      investigationCase.id, 
      { 
        status: 'Cleared (Innocent)', 
        isolationStatus: 'Full Released',
        findings: 'Audited as bona fide commercial counterparty. Transaction isolation released and normal liquidity fully restored.'
      },
      investigationCase.amount
    );
  };

  const handleEscalateFIU = () => {
    onUpdateCase(investigationCase.id, {
      status: 'Escalated to FIU',
      findings: 'Suspicious transaction pattern confirmed consistent with organized mule network. STR/SAR package assembled for regulatory submission.'
    });
  };

  const handleMarkVictim = () => {
    onUpdateCase(investigationCase.id, {
      status: 'Under Review',
      findings: 'Confirmed as unaware victim of coercive fraud/impersonation. Account protected from punitive sanctions.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-200 animate-scaleUp my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                {investigationCase.id}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
                investigationCase.status === 'Cleared (Innocent)' 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : investigationCase.status === 'Escalated to FIU' 
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {investigationCase.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Case Audit: {investigationCase.accountHolder}
            </h2>
            <p className="text-xs text-slate-400">
              Created: {investigationCase.createdTime} • Case Target Amount: ₹{investigationCase.amount.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ethical Principles reminder in Case Review */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
          <div>
            <strong className="text-sky-300">Presumption of Innocence Protocol (Section 4 &amp; 19):</strong>
            <p className="text-slate-400 mt-0.5">
              Risk scores are probabilistic indicators, not proof of criminal intent. Check whether this account received funds through downstream commercial operations before taking restrictive enforcement.
            </p>
          </div>
        </div>

        {/* Isolation & Account Status */}
        {primaryAccount && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Account Financial Position</span>
              <span className="text-slate-300 font-mono">Role: {primaryAccount.role}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Total Balance</span>
                <div className="font-bold text-white font-mono mt-0.5">₹{primaryAccount.totalBalance.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                <span className="text-[10px] text-emerald-400 uppercase font-medium">Unrestricted Funds</span>
                <div className="font-bold text-emerald-300 font-mono mt-0.5">₹{primaryAccount.normalFunds.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-amber-950/40 p-2 rounded border border-amber-800/40">
                <span className="text-[10px] text-amber-400 uppercase font-medium">Isolated Amount</span>
                <div className="font-bold text-amber-300 font-mono mt-0.5">₹{primaryAccount.amountUnderReview.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Explainable Signals (Section 6) */}
        {transaction && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Explainable Risk Signals (Score: {transaction.riskScore}/100)</span>
              <span className="text-[11px] font-mono text-slate-400">{transaction.channel} Transfer</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {transaction.signals.map(sig => (
                <div
                  key={sig.code}
                  className={`p-2 rounded text-xs border flex items-center justify-between ${
                    sig.triggered 
                      ? 'bg-red-950/30 border-red-800/50 text-red-200' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-medium text-white">{sig.name}</span>
                    <p className="text-[11px] text-slate-400">{sig.explanation}</p>
                  </div>
                  <span className={`font-mono font-bold shrink-0 ml-2 ${sig.triggered ? 'text-red-400' : 'text-slate-600'}`}>
                    {sig.triggered ? `+${sig.points}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Response / Supporting Evidence (Section 9) */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            Customer Response &amp; Evidence (Section 9)
          </div>

          {transaction?.customerResponse ? (
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Response Status:</span>
                <span className="font-semibold text-sky-300 capitalize">{transaction.customerResponse.status}</span>
              </div>
              {transaction.customerResponse.purpose && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Declared Purpose:</span>
                  <span className="text-white">{transaction.customerResponse.purpose}</span>
                </div>
              )}
              {transaction.customerResponse.evidenceUploaded && (
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Attached Document:</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {transaction.customerResponse.evidenceUploaded}
                  </span>
                </div>
              )}
              {transaction.customerResponse.notes && (
                <div className="text-slate-400 italic">
                  "{transaction.customerResponse.notes}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 italic">
              Awaiting customer verification through the Customer Assurance Portal.
            </div>
          )}
        </div>

        {/* Audit Case Notes */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Investigation Chronology &amp; Notes
          </span>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-32 overflow-y-auto space-y-1.5 text-xs text-slate-300">
            {investigationCase.notes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-sky-500">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add investigator note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              className="flex-1 bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              onClick={handleAddNote}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              Add Note
            </button>
          </div>
        </div>

        {/* Adjudication Actions */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Analyst Determination
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              id="btn-release-isolation"
              onClick={handleReleaseFunds}
              disabled={investigationCase.isolationStatus === 'Full Released'}
              className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              Release Isolated Funds (Clear)
            </button>

            <button
              id="btn-mark-victim"
              onClick={handleMarkVictim}
              className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Classify Potential Victim
            </button>

            <button
              id="btn-escalate-fiu"
              onClick={handleEscalateFIU}
              className="py-2 px-3 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Escalate to FIU / Cyber Cell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
