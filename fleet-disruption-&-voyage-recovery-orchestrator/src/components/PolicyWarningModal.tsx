import React from "react";
import { Role } from "../types/orchestrator";
import { AlertOctagon, X, ShieldAlert, BookOpen, ArrowRight } from "lucide-react";

interface PolicyWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorTitle: string;
  errorMessage: string;
  actorRole: Role;
  requiredRole?: string;
  prdReference: string;
}

export const PolicyWarningModal: React.FC<PolicyWarningModalProps> = ({
  isOpen,
  onClose,
  errorTitle,
  errorMessage,
  actorRole,
  requiredRole,
  prdReference
}) => {
  if (!isOpen) return null;

  return (
    <div id="policy-warning-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-rose-600/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Banner Header */}
        <div className="px-6 py-4 bg-rose-950/90 border-b border-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-100 uppercase tracking-wide">
                Policy Gate Intercept
              </h3>
              <p className="text-xs text-rose-300 font-mono">
                {prdReference} Authorization Boundary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              {errorTitle}
            </h4>
            <p className="text-slate-300 mt-2 font-mono text-[11px] leading-relaxed bg-slate-900 p-2.5 rounded border border-slate-800 text-rose-300">
              {errorMessage}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block uppercase">Attempted Actor:</span>
              <span className="font-semibold text-amber-400 text-xs mt-0.5 block">
                {actorRole}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block uppercase">Mandatory Authority:</span>
              <span className="font-semibold text-emerald-400 text-xs mt-0.5 block">
                {requiredRole || "Master (Captain) Role"}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-400 flex items-start space-x-2">
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-slate-300">PRD Clause:</strong> Under FR-010 and maritime SOLAS governance, all navigation-impacting route deviations, altered waypoint tracks, and sea-lane choices strictly require Master (Captain) signature. FleetOps and Observers cannot override captain navigation authority.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500">Security event logged to Immutable Audit Trail</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
