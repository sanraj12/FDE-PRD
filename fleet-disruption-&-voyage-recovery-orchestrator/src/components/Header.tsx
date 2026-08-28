import React from "react";
import {
  Role
} from "../types/orchestrator";
import {
  Anchor,
  Shield,
  FileCheck2,
  Cpu,
  Compass,
  Building2,
  Eye,
  PlayCircle,
  Download,
  AlertTriangle,
  Radio
} from "lucide-react";

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  onOpenTestSuite: () => void;
  onOpenAuditLog: () => void;
  onOpenIngestModal: () => void;
  auditCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenTestSuite,
  onOpenAuditLog,
  onOpenIngestModal,
  auditCount
}) => {
  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.MASTER:
        return <Anchor className="w-4 h-4 text-amber-600" />;
      case Role.FLEET_OPS:
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case Role.BRIDGE_TEAM:
        return <Compass className="w-4 h-4 text-emerald-600" />;
      case Role.SAFETY_OBS:
        return <Shield className="w-4 h-4 text-purple-600" />;
      case Role.AUDIT_OBS:
        return <Eye className="w-4 h-4 text-indigo-600" />;
      case Role.AI_SYSTEM:
        return <Cpu className="w-4 h-4 text-rose-600" />;
    }
  };

  const getRolePermissionsDescription = (role: Role) => {
    switch (role) {
      case Role.MASTER:
        return "Supreme Authority — Nav-Impacting & Ops Plan Approvals";
      case Role.FLEET_OPS:
        return "Commercial & Ops Approvals — Nav Plans Require Master";
      case Role.BRIDGE_TEAM:
        return "Bridge Telemetry, Watch Logs & Constraint Updates";
      case Role.SAFETY_OBS:
        return "Read-Only Safety Inspection & Compliance Review";
      case Role.AUDIT_OBS:
        return "Read-Only Regulatory & Provenance Verification";
      case Role.AI_SYSTEM:
        return "Drafting & RAG — Autonomous Nav Execution Prohibited";
    }
  };

  return (
    <header id="orchestrator-header" className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      {/* Top Banner with System Identity & Policy Standards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Core Engine Badges */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                Fleet Disruption & Voyage Recovery Orchestrator
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono font-medium">
                PRD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Deterministic Constraint Solver • Centralized Policy Gate • Idempotency Deduplication • FR-013 Provenance
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-run-prd-tests"
            onClick={onOpenTestSuite}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="Execute the 7 verification test obligations from PRD Section 11"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>PRD Test Suite (7)</span>
          </button>

          <button
            id="btn-ingest-disruption"
            onClick={onOpenIngestModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>+ Ingest Event</span>
          </button>

          <button
            id="btn-open-audit-log"
            onClick={onOpenAuditLog}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title="View immutable audit log and download FR-013 JSON export"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 text-[10px] font-mono">
              {auditCount}
            </span>
          </button>
        </div>
      </div>

      {/* Role Authority Control Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Active Authority Role:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {Object.values(Role).map((role) => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    id={`role-btn-${role.toLowerCase()}`}
                    onClick={() => onRoleChange(role)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white border border-blue-500/50 shadow-sm ring-1 ring-blue-500/30"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800"
                    }`}
                  >
                    {getRoleIcon(role)}
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Role Permissions Brief */}
          <div className="text-xs text-slate-300 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Current Gate:</span>
            <span className="font-medium text-slate-200">{getRolePermissionsDescription(currentRole)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
