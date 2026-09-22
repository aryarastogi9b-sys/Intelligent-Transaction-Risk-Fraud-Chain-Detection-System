import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  UserCheck, 
  Database, 
  PlayCircle, 
  Scale,
  Bell,
  Sliders,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'analyst' | 'customer' | 'mllab';
  onSelectTab: (tab: 'analyst' | 'customer' | 'mllab') => void;
  onOpenSimulator: () => void;
  pendingAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSimulator,
  pendingAlertsCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">
                  Intelligent Transaction Risk &amp; Fraud-Chain Detection System
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  v2.4 Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Banking Fraud Graph Analytics • Transaction-Level Isolation • Ethical Downstream Protection
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="nav-tab-analyst"
              onClick={() => onSelectTab('analyst')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'analyst'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Analyst Console
            </button>

            <button
              id="nav-tab-customer"
              onClick={() => onSelectTab('customer')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all relative ${
                activeTab === 'customer'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Customer Assurance Portal
              {pendingAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              id="nav-tab-mllab"
              onClick={() => onSelectTab('mllab')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'mllab'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              ML &amp; Dataset Lab
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-nav-simulate"
              onClick={onOpenSimulator}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Simulate</span> Scenario
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectTab('analyst')}
            className={`py-1 px-2 rounded font-medium flex items-center gap-1 ${
              activeTab === 'analyst' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Analyst
          </button>
          <button
            onClick={() => onSelectTab('customer')}
            className={`py-1 px-2 rounded font-medium flex items-center gap-1 ${
              activeTab === 'customer' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Customer Portal
          </button>
          <button
            onClick={() => onSelectTab('mllab')}
            className={`py-1 px-2 rounded font-medium flex items-center gap-1 ${
              activeTab === 'mllab' ? 'text-sky-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> ML Lab
          </button>
        </div>
      </div>
    </header>
  );
};
