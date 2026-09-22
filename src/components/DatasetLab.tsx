import React, { useState } from 'react';
import { Transaction, BankAccount } from '../types';
import { ML_FEATURE_IMPORTANCES, runMLInference } from '../services/mlModel';
import { 
  Database, 
  Download, 
  Cpu, 
  BarChart3, 
  CheckCircle, 
  FileSpreadsheet, 
  ArrowRight, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface DatasetLabProps {
  transactions: Transaction[];
  accounts: BankAccount[];
}

export const DatasetLab: React.FC<DatasetLabProps> = ({ transactions, accounts }) => {
  const [selectedTxId, setSelectedTxId] = useState<string>(transactions[0]?.id || '');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeTx = transactions.find(t => t.id === selectedTxId) || transactions[0];
  const sender = accounts.find(a => a.id === activeTx?.senderId);
  const receiver = accounts.find(a => a.id === activeTx?.receiverId);

  // Run ML inference
  const mlResult = runMLInference(activeTx || {}, sender, receiver, activeTx?.signals.find(s => s.code === 'SIG_CONNECTED_SUSPICIOUS')?.triggered ? 1 : 0);

  // Generate CSV download
  const handleExportCSV = () => {
    const headers = ['transaction_id,sender_id,receiver_id,amount,timestamp,transaction_type,risk_score,risk_level,ethical_status,mule_pattern,is_isolated'];
    const rows = transactions.map(t => 
      `"${t.id}","${t.senderId}","${t.receiverId}",${t.amount},"${t.timestamp}","${t.channel}",${t.riskScore},"${t.riskLevel}","${t.status}","${t.mulePattern || 'none'}",${t.isIsolated}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `synthetic_banking_fraud_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              Data Science &amp; Machine Learning Laboratory
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Sections 11 &amp; 12
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Random Forest &amp; Isolation Forest synthetic banking dataset, feature importances, and topology vector embeddings
          </p>
        </div>

        <button
          id="btn-export-dataset-csv"
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow transition-colors"
        >
          <Download className="w-4 h-4" />
          {downloadSuccess ? 'Downloaded CSV!' : 'Export Synthetic Dataset (CSV)'}
        </button>
      </div>

      {/* Top Grid: Model Diagnostics & Decision Tree Path */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ML Feature Weights */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Trained Model Feature Importances (Random Forest)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">100 Trees • Gini Index</span>
          </div>

          <div className="space-y-3">
            {ML_FEATURE_IMPORTANCES.map(feat => (
              <div key={feat.feature} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">{feat.feature}</span>
                  <span className="text-sky-400 font-mono font-bold">{(feat.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${feat.importance * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">{feat.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Anomaly Inference */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Live Inference Sandbox
            </h3>
            <select
              value={selectedTxId}
              onChange={(e) => setSelectedTxId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1"
            >
              {transactions.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} (₹{t.amount.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Random Forest Probability</span>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {mlResult.rfScore}%
              </div>
              <span className="text-[10px] text-slate-500">Confidence: {mlResult.modelConfidence}%</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Isolation Forest Anomaly</span>
              <div className="text-xl font-bold text-purple-400 font-mono mt-1">
                {mlResult.isolationForestScore}
              </div>
              <span className="text-[10px] text-slate-500">&gt; 0.60 indicates outlier</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ensemble Decision Tree Pathway
            </span>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              {mlResult.decisionTreePath.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sky-400 text-[10px]">L{idx + 1} &gt;</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Dataset Table (Page 4 Section 12) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Synthetic Banking Transaction Dataset Schema (Section 12)
            </h3>
            <p className="text-xs text-slate-400">
              Field mapping: transaction_id | sender_id | receiver_id | amount | timestamp | transaction_type | risk_label
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {transactions.length} synthetic rows loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-2.5">transaction_id</th>
                <th className="p-2.5">sender_id</th>
                <th className="p-2.5">receiver_id</th>
                <th className="p-2.5">amount</th>
                <th className="p-2.5">timestamp</th>
                <th className="p-2.5">channel</th>
                <th className="p-2.5">risk_score</th>
                <th className="p-2.5">ethical_label</th>
                <th className="p-2.5">isolation_flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 text-white font-semibold">{t.id}</td>
                  <td className="p-2.5 text-slate-400">{t.senderId}</td>
                  <td className="p-2.5 text-slate-400">{t.receiverId}</td>
                  <td className="p-2.5 text-white">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-slate-400">{t.timestamp}</td>
                  <td className="p-2.5 text-sky-400">{t.channel}</td>
                  <td className="p-2.5">
                    <span className={t.riskScore > 75 ? 'text-red-400 font-bold' : t.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {t.riskScore}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className="text-slate-300 font-sans">{t.status}</span>
                  </td>
                  <td className="p-2.5">
                    {t.isIsolated ? (
                      <span className="text-amber-400">YES (₹{t.isolatedAmount.toLocaleString('en-IN')})</span>
                    ) : (
                      <span className="text-slate-500">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
