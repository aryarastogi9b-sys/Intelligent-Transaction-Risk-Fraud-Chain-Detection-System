import React, { useState, useRef } from 'react';
import { BankAccount, Transaction, AccountRole } from '../types';
import { Shield, AlertTriangle, Building2, User, Truck, HelpCircle, CheckCircle, Info, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface FraudGraphProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  highlightChainTxId?: string | null;
}

interface NodePosition {
  [id: string]: { x: number; y: number };
}

// Fixed or calculated positions for the graph nodes
const DEFAULT_NODE_POSITIONS: NodePosition = {
  'ACC-FRD-A101': { x: 120, y: 190 },
  'ACC-SRC-G701': { x: 120, y: 350 },
  'ACC-SRC-G702': { x: 120, y: 480 },
  'ACC-MULE-B204': { x: 380, y: 320 },
  'ACC-VIC-E518': { x: 380, y: 130 },
  'ACC-BIZ-C309': { x: 640, y: 320 },
  'ACC-SUP-D412': { x: 880, y: 320 },
  'ACC-REG-F620': { x: 640, y: 490 }
};

export const FraudGraph: React.FC<FraudGraphProps> = ({
  accounts,
  transactions,
  selectedAccountId,
  onSelectAccount,
  highlightChainTxId
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeColor = (role: AccountRole, status: string) => {
    switch (role) {
      case 'suspected_fraudster':
        return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', ring: 'rgba(239, 68, 68, 0.4)' };
      case 'mule_intermediary':
        return { bg: '#ffedd5', border: '#f97316', text: '#9a3412', ring: 'rgba(249, 115, 22, 0.3)' };
      case 'innocent_business':
        return { bg: '#e0f2fe', border: '#0284c7', text: '#075985', ring: 'rgba(2, 132, 199, 0.3)' };
      case 'downstream_supplier':
        return { bg: '#ecfdf5', border: '#10b981', text: '#065f46', ring: 'rgba(16, 185, 129, 0.3)' };
      case 'potential_victim':
        return { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', ring: 'rgba(168, 85, 247, 0.3)' };
      case 'regular_customer':
      default:
        return { bg: '#f1f5f9', border: '#64748b', text: '#334155', ring: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const getNodeIcon = (role: AccountRole) => {
    switch (role) {
      case 'suspected_fraudster':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'mule_intermediary':
        return <RotateCcw className="w-5 h-5 text-amber-600" />;
      case 'innocent_business':
        return <Building2 className="w-5 h-5 text-sky-600" />;
      case 'downstream_supplier':
        return <Truck className="w-5 h-5 text-emerald-600" />;
      case 'potential_victim':
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      case 'regular_customer':
      default:
        return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div 
      id="fraud-graph-container"
      ref={containerRef}
      className="relative w-full h-[520px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 select-none shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Grid */}
      <div 
        id="graph-bg" 
        className="absolute inset-0 opacity-20 pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
          backgroundSize: '28px 28px',
          transform: `translate(${pan.x % 28}px, ${pan.y % 28}px)`
        }}
      />

      {/* Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
        <span className="font-medium text-slate-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          Money-Flow Topology
        </span>
        <span className="text-slate-600">|</span>
        <span>{accounts.length} Accounts</span>
        <span>•</span>
        <span>{transactions.length} Flows</span>
      </div>

      {/* Zoom / Pan Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 shadow-lg">
        <button
          id="btn-zoom-in"
          onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-reset-zoom"
          onClick={resetView}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex flex-wrap gap-3 items-center">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Node Types:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30"></span>
          Suspected Fraudster
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30"></span>
          Mule Relay
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30"></span>
          Potentially Exposed (Merchant)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
          Supplier (Protected)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/30"></span>
          Potential Victim
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        id="fraud-graph-svg"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <defs>
          <linearGradient id="fraudEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="exposedEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="cleanEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
          </linearGradient>

          {/* Arrow markers */}
          <marker id="arrow-critical" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-high" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316" />
          </marker>
          <marker id="arrow-medium" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
          </marker>
          <marker id="arrow-low" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>
        </defs>

        {/* Render Edges (Transactions) */}
        {transactions.map(tx => {
          const srcPos = DEFAULT_NODE_POSITIONS[tx.senderId] || { x: 200, y: 200 };
          const tgtPos = DEFAULT_NODE_POSITIONS[tx.receiverId] || { x: 500, y: 200 };

          // Slight bezier curve offset for readability
          const dx = tgtPos.x - srcPos.x;
          const dy = tgtPos.y - srcPos.y;
          const midX = (srcPos.x + tgtPos.x) / 2;
          const midY = (srcPos.y + tgtPos.y) / 2 - (dx !== 0 ? Math.min(30, Math.abs(dx) * 0.1) : 20);

          const isHighlighted = highlightChainTxId === tx.id || hoveredEdgeId === tx.id;
          const isCritical = tx.riskLevel === 'critical';
          const isHigh = tx.riskLevel === 'high';

          const strokeColor = isCritical 
            ? '#ef4444' 
            : isHigh 
              ? '#f97316' 
              : tx.riskLevel === 'medium' 
                ? '#0284c7' 
                : '#475569';

          const markerId = `arrow-${tx.riskLevel}`;

          return (
            <g 
              key={tx.id} 
              className="cursor-pointer transition-opacity duration-200"
              onMouseEnter={() => setHoveredEdgeId(tx.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
            >
              {/* Invisible wider hit area */}
              <path
                d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
              />

              {/* Main transaction edge */}
              <path
                d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHighlighted ? 3.5 : (isCritical || isHigh) ? 2.5 : 1.5}
                strokeDasharray={tx.mulePattern === 'multi_hop' || tx.mulePattern === 'velocity' ? '6,3' : undefined}
                markerEnd={`url(#${markerId})`}
                className={isCritical ? 'animate-pulse' : ''}
              />

              {/* Edge Label: Amount & Channel Badge */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-42"
                  y="-12"
                  width="84"
                  height="22"
                  rx="11"
                  fill="#0f172a"
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2 : 1}
                  className="shadow-md"
                />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  ₹{tx.amount >= 1000 ? `${(tx.amount / 1000).toFixed(0)}k` : tx.amount} • {tx.channel}
                </text>
              </g>

              {/* Hover Tooltip for Edge */}
              {hoveredEdgeId === tx.id && (
                <g transform={`translate(${midX}, ${midY - 24})`}>
                  <rect
                    x="-100"
                    y="-30"
                    width="200"
                    height="28"
                    rx="6"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-13"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {tx.timestamp} • Score: {tx.riskScore}/100 ({tx.riskLevel.toUpperCase()})
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render Nodes (Accounts) */}
        {accounts.map(acc => {
          const pos = DEFAULT_NODE_POSITIONS[acc.id] || { x: 450, y: 250 };
          const isSelected = selectedAccountId === acc.id;
          const isHovered = hoveredNodeId === acc.id;
          const styling = getNodeColor(acc.role, acc.status);

          return (
            <g
              key={acc.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer select-none"
              onClick={() => onSelectAccount(acc.id)}
              onMouseEnter={() => setHoveredNodeId(acc.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Outer Glow / Halo for selected or high risk */}
              {(isSelected || isHovered || acc.riskScore > 75) && (
                <circle
                  r="34"
                  fill="none"
                  stroke={styling.border}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeOpacity={isSelected ? 0.8 : 0.4}
                  className="animate-pulse"
                />
              )}

              {/* Main Node Circle */}
              <circle
                r="26"
                fill={styling.bg}
                stroke={styling.border}
                strokeWidth={isSelected ? 3 : 2}
                className="transition-transform duration-150"
              />

              {/* Node Icon */}
              <foreignObject x="-11" y="-11" width="22" height="22" className="pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  {getNodeIcon(acc.role)}
                </div>
              </foreignObject>

              {/* Node Label (Account Holder) */}
              <text
                x="0"
                y="40"
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="11"
                fontWeight="600"
                className="drop-shadow-sm"
              >
                {acc.accountHolder.length > 20 ? `${acc.accountHolder.slice(0, 18)}…` : acc.accountHolder}
              </text>

              {/* Role / Status Badge */}
              <text
                x="0"
                y="53"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
              >
                {acc.status}
              </text>

              {/* Risk Score Pill on Top */}
              <g transform="translate(18, -18)">
                <circle
                  r="11"
                  fill={acc.riskScore >= 75 ? '#ef4444' : acc.riskScore >= 50 ? '#f97316' : acc.riskScore >= 25 ? '#0284c7' : '#10b981'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  {acc.riskScore}
                </text>
              </g>

              {/* Transaction-level isolation indicator badge if funds under review */}
              {acc.amountUnderReview > 0 && (
                <g transform="translate(-18, -18)">
                  <circle
                    r="10"
                    fill="#3b82f6"
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontWeight="bold"
                  >
                    ₹
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
