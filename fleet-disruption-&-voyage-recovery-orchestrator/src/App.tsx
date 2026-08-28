/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Role,
  Vessel,
  DisruptionEvent,
  Constraint,
  RecoveryOption,
  ApprovalRecord,
  EvidenceItem,
  FreshnessStatus
} from "./types/orchestrator";
import {
  FleetOrchestrator,
  DeterministicConstraintSolver
} from "./services/orchestratorEngine";
import {
  INITIAL_VESSELS,
  INITIAL_DISRUPTIONS,
  INITIAL_CONSTRAINTS,
  INITIAL_RECOVERY_OPTIONS
} from "./data/mockFleetData";
import { Header } from "./components/Header";
import { FleetOverview } from "./components/FleetOverview";
import { DisruptionDetailView } from "./components/DisruptionDetailView";
import { PrdTestSuiteModal } from "./components/PrdTestSuiteModal";
import { AuditTrailDrawer } from "./components/AuditTrailDrawer";
import { IngestDisruptionModal } from "./components/IngestDisruptionModal";
import { DraftRecoveryModal } from "./components/DraftRecoveryModal";
import { PolicyWarningModal } from "./components/PolicyWarningModal";
import {
  Anchor,
  Shield,
  FileCheck2,
  Cpu,
  AlertTriangle,
  PlayCircle,
  Download,
  Info,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // Initialize the Fleet Orchestrator engine
  const [orchestrator] = useState<FleetOrchestrator>(() => {
    const orch = new FleetOrchestrator();

    // Populate initial disruptions into orchestrator
    for (const d of INITIAL_DISRUPTIONS) {
      orch.ingest_event(d.idempotency_key, d.vessel_id, d.event_type, d.evidence, {
        title: d.title,
        description: d.description,
        vessel_name: d.vessel_name,
        severity: d.severity,
        location_name: d.location_name,
        lat: d.lat,
        lng: d.lng
      });
    }

    // Populate initial constraints
    for (const [disruptionId, constraints] of Object.entries(INITIAL_CONSTRAINTS)) {
      orch.setConstraints(disruptionId, constraints);
    }

    // Populate initial recovery options
    for (const [disruptionId, options] of Object.entries(INITIAL_RECOVERY_OPTIONS)) {
      const constraints = INITIAL_CONSTRAINTS[disruptionId] || [];
      for (const opt of options) {
        orch.generate_and_validate_option(
          disruptionId,
          opt.title,
          opt.description,
          opt.is_navigation_impacting,
          constraints,
          opt.evidence_refs,
          opt.metrics
        );
      }
    }

    return orch;
  });

  // State
  const [currentRole, setCurrentRole] = useState<Role>(Role.MASTER);
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>(INITIAL_DISRUPTIONS);
  const [selectedDisruptionId, setSelectedDisruptionId] = useState<string>("evt-typhoon-luzon");
  const [selectedVesselId, setSelectedVesselId] = useState<string>("V-ALPHA");

  // Local constraints & options per disruption
  const [constraintsMap, setConstraintsMap] =
    useState<Record<string, Constraint[]>>(INITIAL_CONSTRAINTS);
  const [recoveryOptionsMap, setRecoveryOptionsMap] =
    useState<Record<string, RecoveryOption[]>>(INITIAL_RECOVERY_OPTIONS);
  const [approvalsMap, setApprovalsMap] = useState<Map<string, ApprovalRecord>>(new Map());
  const [auditLogs, setAuditLogs] = useState(orchestrator.audit.logs);

  // Modals & Drawers
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Policy Alert
  const [policyAlert, setPolicyAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    requiredRole?: string;
    prdRef?: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  const refreshAuditLogs = () => {
    setAuditLogs([...orchestrator.audit.logs]);
  };

  const activeDisruption = useMemo(() => {
    return (
      disruptions.find((d) => d.id === selectedDisruptionId) ||
      disruptions[0] ||
      INITIAL_DISRUPTIONS[0]
    );
  }, [disruptions, selectedDisruptionId]);

  const activeConstraints = useMemo(() => {
    return constraintsMap[activeDisruption.id] || [];
  }, [constraintsMap, activeDisruption.id]);

  const activeOptions = useMemo(() => {
    return recoveryOptionsMap[activeDisruption.id] || [];
  }, [recoveryOptionsMap, activeDisruption.id]);

  // Solver Status calculation
  const solverStatus = useMemo(() => {
    return orchestrator.solver.validate(activeConstraints);
  }, [orchestrator, activeConstraints]);

  // Actions
  const handleUpdateConstraints = (newConstraints: Constraint[]) => {
    orchestrator.setConstraints(activeDisruption.id, newConstraints);
    setConstraintsMap((prev) => ({
      ...prev,
      [activeDisruption.id]: newConstraints
    }));
    refreshAuditLogs();
  };

  const handleIngestEvent = (
    idempotencyKey: string,
    vesselId: string,
    eventType: string,
    evidence: EvidenceItem[],
    extraMeta: {
      title: string;
      description: string;
      vessel_name: string;
      severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
      location_name: string;
      lat: number;
      lng: number;
    }
  ) => {
    const { event, duplicate } = orchestrator.ingest_event(
      idempotencyKey,
      vesselId,
      eventType,
      evidence,
      extraMeta
    );

    refreshAuditLogs();

    if (duplicate) {
      return { duplicate: true };
    }

    if (event) {
      setDisruptions((prev) => [event, ...prev]);
      setSelectedDisruptionId(event.id);
      setSelectedVesselId(vesselId);

      // Default starter constraints for newly ingested event
      const defaultConstraints: Constraint[] = [
        {
          name: "VESSEL_DRAFT_M",
          value: 11.5,
          unit: "meters",
          evidence_ids: evidence.map((e) => e.id),
          status: "accepted",
          reviewer: currentRole,
          description: "Nominal draft clearance limit (Max: 12.5m)"
        },
        {
          name: "BUNKER_SAFETY_MARGIN_PCT",
          value: 24.0,
          unit: "%",
          evidence_ids: evidence.map((e) => e.id),
          status: "accepted",
          reviewer: currentRole,
          description: "Minimum reserve bunker margin (Min: 15%)"
        }
      ];
      orchestrator.setConstraints(event.id, defaultConstraints);
      setConstraintsMap((prev) => ({ ...prev, [event.id]: defaultConstraints }));
      setRecoveryOptionsMap((prev) => ({ ...prev, [event.id]: [] }));
    }

    return { duplicate: false };
  };

  const handleDraftRecoveryOption = (
    title: string,
    description: string,
    isNav: boolean,
    evidenceRefs: string[],
    metrics: { delay_hours: number; fuel_delta_mt: number; cost_delta_usd: number; safety_index: number }
  ) => {
    const { option, validation } = orchestrator.generate_and_validate_option(
      activeDisruption.id,
      title,
      description,
      isNav,
      activeConstraints,
      evidenceRefs,
      metrics
    );

    refreshAuditLogs();

    if (option) {
      setRecoveryOptionsMap((prev) => ({
        ...prev,
        [activeDisruption.id]: [...(prev[activeDisruption.id] || []), option]
      }));
    }

    return validation;
  };

  const handleApproveOption = (
    optionId: string,
    decision: "approved" | "rejected",
    rationale: string
  ) => {
    try {
      const record = orchestrator.approve_option(
        currentRole,
        `${currentRole.toLowerCase()}_user_01`,
        optionId,
        decision,
        rationale
      );
      setApprovalsMap((prev) => new Map(prev).set(record.id, record));
      refreshAuditLogs();
    } catch (err: any) {
      setPolicyAlert({
        isOpen: true,
        title: "Policy Gate Authorization Failure",
        message: err.message,
        requiredRole: "Master (Captain) Authority",
        prdRef: "FR-010"
      });
    }
  };

  return (
    <div id="fleet-orchestrator-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP HEADER & ROLE AUTHORITY SWITCHER */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onOpenAuditLog={() => setIsAuditDrawerOpen(true)}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        auditCount={auditLogs.length}
      />

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Fleet Situational Awareness Board */}
        <FleetOverview
          vessels={vessels}
          disruptions={disruptions}
          selectedDisruptionId={selectedDisruptionId}
          onSelectDisruption={setSelectedDisruptionId}
          onSelectVessel={setSelectedVesselId}
          selectedVesselId={selectedVesselId}
        />

        {/* Selected Disruption Operational Cockpit */}
        {activeDisruption && (
          <DisruptionDetailView
            disruption={activeDisruption}
            constraints={activeConstraints}
            recoveryOptions={activeOptions}
            approvals={approvalsMap}
            currentRole={currentRole}
            onUpdateConstraints={handleUpdateConstraints}
            onApproveOption={handleApproveOption}
            onOpenDraftModal={() => setIsDraftModalOpen(true)}
            onOpenIngestModal={() => setIsIngestModalOpen(true)}
            onTriggerPolicyViolation={(title, message, reqRole, prdRef) => {
              setPolicyAlert({
                isOpen: true,
                title,
                message,
                requiredRole: reqRole,
                prdRef: prdRef || "FR-010"
              });
            }}
            solverStatus={solverStatus}
          />
        )}
      </main>

      {/* 3. MODALS & SLIDE-OUT DRAWERS */}
      <PrdTestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
        onRefreshAuditCount={refreshAuditLogs}
      />

      <AuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
      />

      <IngestDisruptionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        vessels={vessels}
        onIngest={handleIngestEvent}
      />

      {activeDisruption && (
        <DraftRecoveryModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          disruption={activeDisruption}
          constraints={activeConstraints}
          evidence={activeDisruption.evidence}
          onDraftOption={handleDraftRecoveryOption}
        />
      )}

      <PolicyWarningModal
        isOpen={policyAlert.isOpen}
        onClose={() => setPolicyAlert((prev) => ({ ...prev, isOpen: false }))}
        errorTitle={policyAlert.title}
        errorMessage={policyAlert.message}
        actorRole={currentRole}
        requiredRole={policyAlert.requiredRole}
        prdReference={policyAlert.prdRef || "FR-010"}
      />
    </div>
  );
}
