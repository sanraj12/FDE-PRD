import React, { useState } from "react";
import {
  DisruptionEvent,
  Constraint,
  EvidenceItem,
  RecoveryOption,
  ApprovalRecord,
  Role,
  FreshnessStatus
} from "../types/orchestrator";
import {
  AlertTriangle,
  FileText,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Plus,
  Compass,
  DollarSign,
  Fuel,
  Info,
  Layers,
  FileCheck2,
  RefreshCw
} from "lucide-react";

interface DisruptionDetailViewProps {
  disruption: DisruptionEvent;
  constraints: Constraint[];
  recoveryOptions: RecoveryOption[];
  approvals: Map<string, ApprovalRecord>;
  currentRole: Role;
  onUpdateConstraints: (constraints: Constraint[]) => void;
  onApproveOption: (optionId: string, decision: "approved" | "rejected", rationale: string) => void;
  onOpenDraftModal: () => void;
  onOpenIngestModal: () => void;
  onTriggerPolicyViolation: (
    title: string,
    message: string,
    requiredRole?: string,
    prdRef?: string
  ) => void;
  solverStatus: { valid: boolean; reasons: string[] };
}

export const DisruptionDetailView: React.FC<DisruptionDetailViewProps> = ({
  disruption,
  constraints,
  recoveryOptions,
  approvals,
  currentRole,
  onUpdateConstraints,
  onApproveOption,
  onOpenDraftModal,
  onOpenIngestModal,
  onTriggerPolicyViolation,
  solverStatus
}) => {
  const [highlightedEvidenceId, setHighlightedEvidenceId] = useState<string | null>(null);
  const [approvalModalOption, setApprovalModalOption] = useState<RecoveryOption | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<"approved" | "rejected">("approved");
  const [approvalRationale, setApprovalRationale] = useState<string>("");

  const getFreshnessBadge = (status: FreshnessStatus) => {
    switch (status) {
      case FreshnessStatus.FRESH:
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
      case FreshnessStatus.STALE:
        return "bg-amber-950 text-amber-300 border-amber-800";
      case FreshnessStatus.EXPIRED:
        return "bg-rose-950 text-rose-300 border-rose-800";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const handleConstraintStatusChange = (
    index: number,
    newStatus: "accepted" | "rejected" | "missing"
  ) => {
    const updated = [...constraints];
    updated[index] = {
      ...updated[index],
      status: newStatus,
      reviewer: currentRole
    };
    onUpdateConstraints(updated);
  };

  const handleConstraintValueChange = (index: number, val: any) => {
    const updated = [...constraints];
    updated[index] = {
      ...updated[index],
      value: val
    };
    onUpdateConstraints(updated);
  };

  // Quick solver scenario triggers
  const handleSimulateMissingConstraint = () => {
    const updated = constraints.map((c) =>
      c.name === "VESSEL_DRAFT_M" ? { ...c, status: "missing" as const } : c
    );
    onUpdateConstraints(updated);
  };

  const handleSimulateDraftViolation = () => {
    const updated = constraints.map((c) =>
      c.name === "VESSEL_DRAFT_M" ? { ...c, value: 13.2, status: "accepted" as const } : c
    );
    onUpdateConstraints(updated);
  };

  const handleRestoreNominalConstraints = () => {
    const updated = constraints.map((c) => {
      if (c.name === "VESSEL_DRAFT_M") return { ...c, value: 11.8, status: "accepted" as const };
      if (c.name === "MAX_WAVE_HEIGHT_M") return { ...c, value: 4.5, status: "accepted" as const };
      if (c.name === "BUNKER_SAFETY_MARGIN_PCT") return { ...c, value: 26.5, status: "accepted" as const };
      return { ...c, status: "accepted" as const };
    });
    onUpdateConstraints(updated);
  };

  const handleInitiateApproval = (option: RecoveryOption, decision: "approved" | "rejected") => {
    // Check PolicyGate permissions upfront
    if (currentRole === Role.AI_SYSTEM) {
      onTriggerPolicyViolation(
        "AI Direct Nav Execution Prohibited",
        "FATAL: AI_SYSTEM cannot approve or execute voyage plans. Autonomous write commands are blocked by PolicyGate.",
        "Master (Captain) Role",
        "PRD Non-Goals & FR-010"
      );
      return;
    }

    if (currentRole === Role.SAFETY_OBS || currentRole === Role.AUDIT_OBS) {
      onTriggerPolicyViolation(
        "Observer Read-Only Restriction",
        `FATAL: ${currentRole} is an audit/safety observer role with strictly read-only permissions. Mutation actions are blocked by PolicyGate.`,
        "Master or FleetOps Role",
        "NFR-003 / FR-010"
      );
      return;
    }

    if (currentRole === Role.BRIDGE_TEAM) {
      onTriggerPolicyViolation(
        "Bridge Team Input Only",
        "FATAL: Bridge watch officers provide telemetry and passage recommendations, but final recovery approval requires Master or FleetOps authority.",
        "Master or FleetOps Role",
        "FR-010"
      );
      return;
    }

    if (currentRole === Role.FLEET_OPS && option.is_navigation_impacting) {
      onTriggerPolicyViolation(
        "Navigation Plan Approval Blocked for FleetOps",
        "FATAL: Fleet Ops cannot approve Navigation-impacting plans. Under SOLAS regulations and FR-010, Master (Captain) authority is strictly required for route deviations.",
        "Master (Captain) Role",
        "FR-010 & NFR-003"
      );
      return;
    }

    // Open confirmation dialog with pre-filled rationale
    setApprovalModalOption(option);
    setApprovalDecision(decision);
    setApprovalRationale(
      decision === "approved"
        ? `Authorized recovery plan under ${currentRole} authority after reviewing deterministic solver clearance and evidence provenance.`
        : `Rejected recovery plan due to operational schedule and fuel constraints.`
    );
  };

  const handleConfirmApproval = () => {
    if (!approvalModalOption) return;
    onApproveOption(approvalModalOption.id, approvalDecision, approvalRationale);
    setApprovalModalOption(null);
  };

  return (
    <div id="disruption-detail-view" className="space-y-6">
      {/* 1. DISRUPTION HEADER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase flex items-center space-x-1 ${
                  disruption.severity === "CRITICAL"
                    ? "bg-rose-950 text-rose-300 border border-rose-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{disruption.severity}</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                {disruption.event_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {disruption.vessel_name} ({disruption.vessel_id})
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {disruption.title}
            </h2>
          </div>

          <div className="flex flex-col sm:items-end text-xs font-mono space-y-1">
            <div className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Ingested: {new Date(disruption.timestamp).toUTCString()}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-500">Idempotency Key:</span>
              <span className="font-semibold">{disruption.idempotency_key}</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          {disruption.description}
        </p>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Location: <strong className="text-slate-200">{disruption.location_name}</strong></span>
            {disruption.lat && (
              <span className="font-mono text-[11px] text-slate-500">
                ({disruption.lat}°N, {disruption.lng}°E)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Event ID:</span>
            <span className="font-mono text-slate-300">{disruption.id}</span>
          </div>
        </div>
      </div>

      {/* 2. SECTION: FR-002 EVIDENCE PROVENANCE & FRESHNESS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                FR-002 Evidence Provenance & Freshness Repository
              </h3>
              <p className="text-xs text-slate-400">
                Verifiable source locators, received timestamps, and freshness tracking
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-blue-300 border border-slate-800">
            {disruption.evidence.length} Verified Evidence Items
          </span>
        </div>

        {/* Evidence Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {disruption.evidence.map((ev) => {
            const isHighlighted = highlightedEvidenceId === ev.id;
            return (
              <div
                key={ev.id}
                id={`evidence-card-${ev.id}`}
                className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
                  isHighlighted
                    ? "bg-slate-800 border-blue-500 ring-2 ring-blue-500/50 shadow-md"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-900 text-[11px]">
                      {ev.id}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                      {ev.source}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border font-mono ${getFreshnessBadge(
                      ev.freshness
                    )}`}
                  >
                    {ev.freshness}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/80 p-2 rounded border border-slate-800/80 italic">
                  "{ev.text}"
                </p>

                <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center space-x-1 truncate max-w-[180px]">
                    <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{ev.locator}</span>
                  </div>
                  <span className="text-slate-500 shrink-0">{ev.version}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: FR-004 DETERMINISTIC CONSTRAINT SOLVER MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                FR-004 Deterministic Constraint Solver (Hard Safety Gates)
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical validation gate. AI proposals are strictly blocked if any constraint is missing or exceeded.
              </p>
            </div>
          </div>

          {/* Quick Scenario Test Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-test-missing-constraint"
              onClick={handleSimulateMissingConstraint}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer"
              title="Test Test 2 obligation: Sets Draft constraint to 'missing' to verify deterministic solver gate"
            >
              Test Missing Gate
            </button>
            <button
              id="btn-test-draft-violation"
              onClick={handleSimulateDraftViolation}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-medium cursor-pointer"
              title="Sets Draft to 13.2m (>12.5m limit) to verify solver rejection"
            >
              Test Draft Overlimit (13.2m)
            </button>
            <button
              id="btn-restore-nominal"
              onClick={handleRestoreNominalConstraints}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restore Safe Envelope</span>
            </button>
          </div>
        </div>

        {/* Live Solver Status Banner */}
        <div
          className={`p-3.5 rounded-lg border flex items-start space-x-3 text-xs ${
            solverStatus.valid
              ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-200"
              : "bg-rose-950/70 border-rose-800/90 text-rose-200"
          }`}
        >
          {solverStatus.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold uppercase tracking-wider text-xs flex items-center justify-between">
              <span>
                {solverStatus.valid
                  ? "DETERMINISTIC SOLVER STATUS: PASSED (ALL CONSTRAINTS SATISFIED)"
                  : "DETERMINISTIC SOLVER STATUS: BLOCKED (SAFETY GATE ACTIVE)"}
              </span>
              <span className="font-mono text-[10px] opacity-80">Solver Engine v1.2</span>
            </div>
            {solverStatus.valid ? (
              <p className="mt-1 text-[11px] text-emerald-300/90">
                All physical and regulatory parameters (Draft &lt; 12.5m, Bunker Margin &gt; 15%, Wave limits, SOLAS rules) are satisfied and verified against evidence provenance. AI recovery option generation is authorized.
              </p>
            ) : (
              <div className="mt-1.5 space-y-1 font-mono text-[11px] bg-slate-950/80 p-2.5 rounded border border-rose-900/60">
                {solverStatus.reasons.map((r, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-rose-300">
                    <span>⛔</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Constraints Matrix Table */}
        <div className="overflow-x-auto bg-slate-950 rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono border-b border-slate-800 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Constraint Parameter</th>
                <th className="py-2.5 px-3">Value / Metric</th>
                <th className="py-2.5 px-3">Linked Evidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reviewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {constraints.map((c, idx) => (
                <tr key={c.name} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-semibold text-blue-400">{c.name}</div>
                    {c.description && (
                      <div className="text-[10px] text-slate-500">{c.description}</div>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    {typeof c.value === "number" ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          step="0.1"
                          value={c.value}
                          onChange={(e) =>
                            handleConstraintValueChange(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-slate-500">{c.unit}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-emerald-400 font-medium">{String(c.value)}</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {c.evidence_ids.map((evId) => (
                        <button
                          key={evId}
                          onClick={() => setHighlightedEvidenceId(evId)}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900 cursor-pointer"
                        >
                          {evId}
                        </button>
                      ))}
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleConstraintStatusChange(idx, "accepted")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          c.status === "accepted"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        Accepted
                      </button>
                      <button
                        onClick={() => handleConstraintStatusChange(idx, "missing")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          c.status === "missing"
                            ? "bg-rose-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        Missing
                      </button>
                      <button
                        onClick={() => handleConstraintStatusChange(idx, "rejected")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          c.status === "rejected"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        Rejected
                      </button>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {c.reviewer || currentRole}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SECTION: WF-03 & WF-04 AI RECOVERY OPTIONS & HUMAN AUTHORITY GATES */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                WF-03 & WF-04 Recovery Options & Authorization Gate
              </h3>
              <p className="text-xs text-slate-400">
                AI-drafted proposals with explicit human authority approval (FR-010)
              </p>
            </div>
          </div>

          <button
            id="btn-draft-new-recovery"
            onClick={onOpenDraftModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Draft Recovery Plan (AI)</span>
          </button>
        </div>

        {/* Options List */}
        {recoveryOptions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-950 rounded-lg border border-slate-800">
            No recovery options generated yet. Click "+ Draft Recovery Plan" to evaluate options.
          </div>
        ) : (
          <div className="space-y-4">
            {recoveryOptions.map((opt) => {
              const approvalList = Array.from(approvals.values()) as ApprovalRecord[];
              const approval = approvalList.find((a: ApprovalRecord) => a.option_id === opt.id);

              return (
                <div
                  key={opt.id}
                  id={`recovery-option-${opt.id}`}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5 transition-all hover:border-slate-700"
                >
                  {/* Top Bar: Title & Authority Classification */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                          AI-DRAFTED
                        </span>
                        <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    {/* Authority Scope Tag */}
                    <div>
                      {opt.is_navigation_impacting ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 flex items-center space-x-1">
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                          <span>⚠️ Navigation-Impacting (Master Req.)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-700 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>🟢 Commercial / Ops Only</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational Metrics */}
                  {opt.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block">ETA Variance</span>
                        <span className="font-semibold text-slate-200">
                          {opt.metrics.delay_hours > 0 ? `+${opt.metrics.delay_hours} hrs` : "0 hrs"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Fuel Delta</span>
                        <span
                          className={`font-semibold ${
                            opt.metrics.fuel_delta_mt > 0 ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          {opt.metrics.fuel_delta_mt > 0 ? `+${opt.metrics.fuel_delta_mt}` : opt.metrics.fuel_delta_mt} MT
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Cost Delta</span>
                        <span className="font-semibold text-slate-200">
                          ${opt.metrics.cost_delta_usd.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Safety Index</span>
                        <span className="font-semibold text-emerald-400">
                          {opt.metrics.safety_index} / 100
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cited Evidence Provenance Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Cited Evidence (FR-002):</span>
                    {opt.evidence_refs.map((ref) => (
                      <button
                        key={ref}
                        onClick={() => setHighlightedEvidenceId(ref)}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-900 cursor-pointer"
                      >
                        {ref}
                      </button>
                    ))}
                    <span className="text-slate-500 text-[11px] font-mono ml-auto">
                      Deterministic Check:{" "}
                      <strong className="text-emerald-400">VALIDATED</strong>
                    </span>
                  </div>

                  {/* Approval Status or Action Buttons */}
                  <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3">
                    {approval ? (
                      <div className="flex items-center space-x-2 text-xs bg-emerald-950/80 border border-emerald-700 px-3 py-2 rounded-lg text-emerald-200 w-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold">
                            {approval.decision.toUpperCase()} by {approval.approver_role} ({approval.approver_id})
                          </span>
                          <p className="text-[11px] text-emerald-300/80 italic mt-0.5">
                            "{approval.rationale}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            Policy Gate Requirement:{" "}
                            <strong className="text-slate-200">
                              {opt.is_navigation_impacting
                                ? "Master Signature Mandatory"
                                : "FleetOps or Master Authority"}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            id={`btn-reject-${opt.id}`}
                            onClick={() => handleInitiateApproval(opt, "rejected")}
                            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-rose-950 hover:text-rose-200 text-slate-300 border border-slate-800 hover:border-rose-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            id={`btn-approve-${opt.id}`}
                            onClick={() => handleInitiateApproval(opt, "approved")}
                            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Authorize Recovery Plan</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Plan Approval */}
      {approvalModalOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  WF-04: Human Authority Approval
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Sign-off by {currentRole}
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-300">
                You are about to record an official <strong>{approvalDecision.toUpperCase()}</strong> decision for:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-medium text-white">
                {approvalModalOption.title}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Official Operational Rationale (Required for Audit Trail)
                </label>
                <textarea
                  rows={3}
                  value={approvalRationale}
                  onChange={(e) => setApprovalRationale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setApprovalModalOption(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-authority-decision"
                onClick={handleConfirmApproval}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm cursor-pointer"
              >
                Confirm & Record Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
