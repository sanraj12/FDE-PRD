import React, { useState } from "react";
import { runPRDVerificationTests } from "../services/orchestratorEngine";
import { TestSuiteStepResult } from "../types/orchestrator";
import {
  CheckCircle2,
  XCircle,
  Play,
  Download,
  Terminal,
  ShieldCheck,
  X,
  FileCode,
  Sparkles
} from "lucide-react";

interface PrdTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAuditCount?: () => void;
}

export const PrdTestSuiteModal: React.FC<PrdTestSuiteModalProps> = ({
  isOpen,
  onClose,
  onRefreshAuditCount
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{
    steps: TestSuiteStepResult[];
    allPassed: boolean;
    sampleAuditExport: Record<string, any>;
  } | null>(() => runPRDVerificationTests());
  const [activeTab, setActiveTab] = useState<"results" | "json_export">("results");

  if (!isOpen) return null;

  const handleRunSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runPRDVerificationTests();
      setTestResults(results);
      setIsRunning(false);
      onRefreshAuditCount?.();
    }, 450);
  };

  const handleDownloadSampleExport = () => {
    if (!testResults?.sampleAuditExport) return;
    const blob = new Blob([JSON.stringify(testResults.sampleAuditExport, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FR-013-Audit-Verification-Payload-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="prd-test-suite-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">
                  PRD Verification Test Suite
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-500/30">
                  Section 11 Test Obligations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic verification of Idempotency, Hard Constraint Gates, Authority Boundaries, and Immutable Provenance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("results")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "results"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Test Obligations (7/7)
            </button>
            <button
              onClick={() => setActiveTab("json_export")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "json_export"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>FR-013 Sample Export JSON</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {testResults && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center space-x-1.5 ${
                  testResults.allPassed
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    : "bg-rose-950 text-rose-300 border border-rose-700"
                }`}
              >
                {testResults.allPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All 7 PRD Assertions Passed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Assertions Failed</span>
                  </>
                )}
              </span>
            )}

            <button
              id="btn-re-run-tests"
              onClick={handleRunSuite}
              disabled={isRunning}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running..." : "Re-Run Verification Suite"}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "results" && testResults && (
            <div className="space-y-3">
              {testResults.steps.map((step) => (
                <div
                  key={step.step}
                  id={`test-step-${step.step}`}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 transition-all hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {step.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            Test #{step.step}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-100">
                            {step.name}
                          </h4>
                          <span className="text-[11px] font-mono text-blue-400">
                            [{step.prd_req}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          {step.details}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        step.passed
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {step.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>

                  {/* Log stream line */}
                  <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded">
                    <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{step.log_output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "json_export" && testResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    FR-013 Cryptographic Audit Export Payload
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Contains immutable event record with target ID, actor role, timestamp, action details, and version hashes.
                  </p>
                </div>
                <button
                  onClick={handleDownloadSampleExport}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                  {JSON.stringify(testResults.sampleAuditExport, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Policy Engine: v1.0 • Solver: v1.2 • AI Model: qwen-fleet-rag-v1</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
