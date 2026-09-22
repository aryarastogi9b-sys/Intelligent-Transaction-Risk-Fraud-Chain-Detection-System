import React from 'react';
import { MulePatternDetection } from '../types';
import { 
  Network, 
  GitMerge, 
  GitFork, 
  Repeat, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MuleDetectionPanelProps {
  detections: MulePatternDetection[];
  onSelectPattern: (pattern: MulePatternDetection) => void;
}

export const MuleDetectionPanel: React.FC<MuleDetectionPanelProps> = ({
  detections,
  onSelectPattern
}) => {
  const getPatternIcon = (type: MulePatternDetection['type']) => {
    switch (type) {
      case 'concentration':
        return <GitMerge className="w-4 h-4 text-rose-400" />;
      case 'distribution':
        return <GitFork className="w-4 h-4 text-amber-400" />;
      case 'multi_hop':
        return <Network className="w-4 h-4 text-red-400" />;
      case 'structuring':
        return <Repeat className="w-4 h-4 text-purple-400" />;
      case 'velocity':
      default:
        return <Zap className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-400" />
            Mule Account Pattern Intelligence
          </h3>
          <p className="text-xs text-slate-400">
            Section 10: Detection of concentration, distribution, structuring, and multi-hop layering
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
          {detections.length} Active Patterns Detected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {detections.map(detection => (
          <div
            key={detection.id}
            onClick={() => onSelectPattern(detection)}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-950 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  {getPatternIcon(detection.type)}
                  {detection.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  detection.severity === 'Critical'
                    ? 'bg-red-950 text-red-300 border border-red-800/80'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                }`}>
                  {detection.severity}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {detection.description}
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-slate-300">
                Vol: ₹{detection.totalVolume.toLocaleString('en-IN')}
              </span>
              <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Inspect Entities <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
