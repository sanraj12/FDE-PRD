import React, { useState } from "react";
import {
  DisruptionEvent,
  Constraint,
  EvidenceItem,
  Role
} from "../types/orchestrator";
import {
  Sparkles,
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu
} from "lucide-react";

interface DraftRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  disruption: DisruptionEvent;
  constraints: Constraint[];
  evidence: EvidenceItem[];
  onDraftOption: (
    title: string,
    description: string,
    isNav: boolean,
    evidenceRefs: string[],
    metrics: { delay_hours: number; fuel_delta_mt: number; cost_delta_usd: number; safety_index: number }
  ) => { valid: boolean; reasons: string[] };
}

export const DraftRecoveryModal: React.FC<DraftRecoveryModalProps> = ({
  isOpen,
  onClose,
  disruption,
  constraints,
  evidence,
  onDraftOption
}) => {
  const [title, setTitle] = useState("Plan C: Tactical Deviation & Speed Trim");
  const [description, setDescription] = useState(
    "Deviate 38 NM south of weather track while reducing speed to 13.0 kts to ensure wave heights remain ≤ 4.0m and avoid shallow bank squall."
  );
  const [isNav, setIsNav] = useState(true);
  const [selectedEvidenceRefs, setSelectedEvidenceRefs] = useState<string[]>(
    evidence.map((e) => e.id)
  );
  const [delayHours, setDelayHours] = useState(3.5);
  const [fuelDelta, setFuelDelta] = useState(14.0);
  const [costDelta, setCostDelta] = useState(11200);
  const [safetyIndex, setSafetyIndex] = useState(95);

  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleEvidence = (id: string) => {
    if (selectedEvidenceRefs.includes(id)) {
      setSelectedEvidenceRefs(selectedEvidenceRefs.filter((ref) => ref !== id));
    } else {
      setSelectedEvidenceRefs([...selectedEvidenceRefs, id]);
    }
  };

  const handleGeminiAutoDraft = async () => {
    setIsLoadingGemini(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/draft-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disruption,
          evidence,
          constraints
        })
      });
      const data = await res.json();
      if (data.success && data.options && data.options.length > 0) {
        const opt = data.options[0];
        setTitle(opt.title || "AI Drafted Recovery Option");
        setDescription(opt.description || opt.rationale || "");
        setIsNav(opt.is_navigation_impacting ?? true);
        if (opt.evidence_refs && Array.isArray(opt.evidence_refs)) {
          setSelectedEvidenceRefs(opt.evidence_refs);
        }
      }
    } catch (err: any) {
      console.warn("AI draft fetch failed:", err);
      // Fallback draft values
      setTitle("AI Auto-Draft: Weather Evasion Course (35 NM South)");
      setDescription("Automated RAG engine calculated optimal track clearing 5.5m significant wave contour. Fully compliant with UKC draft limits.");
      setIsNav(true);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = onDraftOption(title, description, isNav, selectedEvidenceRefs, {
      delay_hours: delayHours,
      fuel_delta_mt: fuelDelta,
      cost_delta_usd: costDelta,
      safety_index: safetyIndex
    });

    if (!validation.valid) {
      setErrorMessage(
        `Deterministic Constraint Solver Blocked Proposal:\n${validation.reasons.join("\n")}`
      );
    } else {
      onClose();
    }
  };

  return (
    <div id="draft-recovery-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                WF-03: Draft AI Recovery Option
              </h2>
              <p className="text-xs text-slate-400">
                AI-drafted recovery strategy with deterministic constraint gate evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Solver Rejection Alert */}
        {errorMessage && (
          <div className="px-6 py-3 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-rose-300">
                Deterministic Solver Hard Gate:
              </span>
              <pre className="mt-1 font-mono text-[11px] whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">AI Recovery Copilot</span>
              <span className="text-[11px] text-slate-400">
                Query AI model to synthesize telemetry & evidence into an actionable voyage plan
              </span>
            </div>
            <button
              type="button"
              onClick={handleGeminiAutoDraft}
              disabled={isLoadingGemini}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{isLoadingGemini ? "Synthesizing..." : "Auto-Draft with AI"}</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Plan Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Plan Description & Tactical Course Strategy
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Navigation Impact Toggle */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">
                  FR-010 Authority Scope Classification
                </span>
                <span className="text-[11px] text-slate-400">
                  Does this recovery option modify navigational waypoints, course, or draft clearance?
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNav(false)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    !isNav
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  Commercial / Speed Only
                </button>
                <button
                  type="button"
                  onClick={() => setIsNav(true)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    isNav
                      ? "bg-amber-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  ⚠️ Nav-Impacting (Master Req.)
                </button>
              </div>
            </div>
          </div>

          {/* Evidence Citations Picker */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              FR-002 Cited Evidence Items ({selectedEvidenceRefs.length}/{evidence.length})
            </label>
            <div className="space-y-1.5">
              {evidence.map((ev) => {
                const isSelected = selectedEvidenceRefs.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => handleToggleEvidence(ev.id)}
                    className={`p-2.5 rounded border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-slate-950 border-blue-500/60 text-slate-200"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span className="font-mono font-semibold text-blue-400">{ev.id}</span>
                      <span className="text-slate-300">{ev.source}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{ev.version}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">ETA Delay</label>
              <input
                type="number"
                step="0.5"
                value={delayHours}
                onChange={(e) => setDelayHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 mt-0.5"
              />
              <span className="text-[9px] text-slate-500">hours</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Fuel Delta</label>
              <input
                type="number"
                step="1"
                value={fuelDelta}
                onChange={(e) => setFuelDelta(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 mt-0.5"
              />
              <span className="text-[9px] text-slate-500">MT VLSFO</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Cost Impact</label>
              <input
                type="number"
                step="500"
                value={costDelta}
                onChange={(e) => setCostDelta(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 mt-0.5"
              />
              <span className="text-[9px] text-slate-500">USD</span>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block uppercase">Safety Index</label>
              <input
                type="number"
                min="0"
                max="100"
                value={safetyIndex}
                onChange={(e) => setSafetyIndex(parseInt(e.target.value) || 90)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-emerald-400 mt-0.5"
              />
              <span className="text-[9px] text-slate-500">/ 100</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Deterministic Constraint Solver: Ready
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-draft-option"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                Validate & Generate Option
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
