import React, { useState } from "react";
import { AuditEvent, Role } from "../types/orchestrator";
import {
  FileCheck2,
  X,
  Download,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Clock,
  Key
} from "lucide-react";

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditEvent[];
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "ALL" || log.actor_role === selectedRole;
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;

    return matchesSearch && matchesRole && matchesAction;
  });

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FR-013-Fleet-Audit-Log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("BLOCKED") || action.includes("DROPPED") || action.includes("REJECTION")) {
      return "bg-rose-950 text-rose-300 border-rose-800";
    }
    if (action.includes("APPROVAL")) {
      return "bg-emerald-950 text-emerald-300 border-emerald-800";
    }
    if (action.includes("INGESTED")) {
      return "bg-blue-950 text-blue-300 border-blue-800";
    }
    if (action.includes("OPTION_GENERATED")) {
      return "bg-purple-950 text-purple-300 border-purple-800";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div id="audit-trail-drawer-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">
                  FR-009 / FR-013 Immutable Audit Log & Provenance Stream
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-blue-500/30">
                  {logs.length} Events
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tamper-evident operational ledger recording actor role, timestamp, action, target, and material versions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-export-audit-json"
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
              title="Download full PRD-compliant FR-013 JSON audit export"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export FR-013 JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search action, actor, target or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                {Object.values(Role).map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-slate-200">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Actions</option>
                <option value="EVENT_INGESTED">EVENT_INGESTED</option>
                <option value="DUPLICATE_EVENT_DROPPED">DUPLICATE_EVENT_DROPPED</option>
                <option value="OPTION_GENERATED">OPTION_GENERATED</option>
                <option value="OPTION_GENERATION_BLOCKED">OPTION_GENERATION_BLOCKED</option>
                <option value="APPROVAL_RECORDED">APPROVAL_RECORDED</option>
                <option value="CONSTRAINTS_UPDATED">CONSTRAINTS_UPDATED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No audit events matched current filters.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  id={`audit-event-${log.id}`}
                  className="bg-slate-950 border border-slate-800/90 rounded-lg p-3 text-xs transition-all hover:border-slate-700"
                >
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none"
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <button className="text-slate-400 hover:text-slate-200">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <span className="font-semibold text-blue-400">
                          {log.actor_role}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          ({log.actor_id})
                        </span>
                      </div>
                      <span className="text-slate-500">→</span>
                      <span className="font-mono text-slate-300 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">
                        Target: {log.target_id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-1 font-mono text-slate-500">
                        <Key className="w-3 h-3" />
                        <span>{log.id.slice(0, 12)}...</span>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/40 p-3 rounded">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Event Payload Details
                        </span>
                        <pre className="mt-1 text-[11px] font-mono text-emerald-400 bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          System Versions & Governance Metadata
                        </span>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Policy Gate:</span>
                            <span className="text-blue-400">{log.versions.policy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Solver Engine:</span>
                            <span className="text-emerald-400">{log.versions.solver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">AI RAG Model:</span>
                            <span className="text-purple-400">{log.versions.ai_model}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-900">
                            <span className="text-slate-500">Timestamp (ISO):</span>
                            <span className="text-slate-400">{new Date(log.timestamp).toISOString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>FR-009 Audit Guarantee: Immutable, append-only log</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
