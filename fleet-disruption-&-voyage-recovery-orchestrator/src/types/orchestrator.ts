/**
 * AI Fleet Disruption & Voyage Recovery Orchestrator
 * Domain Entities & Contracts (PRD Section 7 & Python Reference Implementation)
 */

export enum Role {
  MASTER = "Master",
  FLEET_OPS = "FleetOps",
  BRIDGE_TEAM = "BridgeTeam",
  SAFETY_OBS = "SafetyObserver",
  AUDIT_OBS = "AuditObserver",
  AI_SYSTEM = "AISystem" // Prohibited from Nav commands
}

export enum EventStatus {
  NEW = "new",
  DEDUPLICATED = "deduplicated",
  RECONCILED = "reconciled"
}

export enum FreshnessStatus {
  FRESH = "fresh",
  STALE = "stale",
  EXPIRED = "expired",
  UNKNOWN = "unknown"
}

export interface EvidenceItem {
  id: string;
  source: string;
  locator: string;
  received_time: number; // Unix timestamp in seconds or ms
  text: string;
  freshness: FreshnessStatus;
  version: string;
}

export interface Constraint {
  name: string;
  value: any;
  evidence_ids: string[];
  status: "accepted" | "rejected" | "missing";
  reviewer?: Role | null;
  unit?: string;
  description?: string;
  limit_explanation?: string;
}

export interface DisruptionEvent {
  id: string;
  idempotency_key: string;
  vessel_id: string;
  vessel_name?: string;
  event_type: string;
  title?: string;
  description?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  timestamp: number;
  status: EventStatus;
  evidence: EvidenceItem[];
  location_name?: string;
  lat?: number;
  lng?: number;
}

export interface RecoveryOption {
  id: string;
  disruption_id: string;
  title: string;
  description: string;
  is_navigation_impacting: boolean;
  generated_by_ai: boolean;
  evidence_refs: string[];
  constraints_validated: boolean;
  rationale?: string;
  solver_check_details?: {
    checked_constraints: number;
    passed: boolean;
    failed_reasons: string[];
  };
  metrics?: {
    delay_hours: number;
    fuel_delta_mt: number;
    cost_delta_usd: number;
    safety_index: number; // 0-100
  };
}

export interface ApprovalRecord {
  id: string;
  option_id: string;
  approver_role: Role;
  approver_id: string;
  decision: "approved" | "rejected";
  rationale: string;
  timestamp: number;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  actor_role: Role;
  actor_id: string;
  action: string;
  target_id: string;
  details: Record<string, any>;
  versions: {
    policy: string;
    solver: string;
    ai_model: string;
  };
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  callsign: string;
  flag: string;
  type: string;
  current_draft_m: number;
  max_draft_m: number;
  speed_knots: number;
  lat: number;
  lng: number;
  origin_port: string;
  destination_port: string;
  eta: string;
  bunker_remaining_pct: number;
  status: "NORMAL" | "DISRUPTED" | "RECOVERY_IN_PROGRESS" | "UNDER_REVIEW";
  active_disruption_id?: string;
}

export interface TestSuiteStepResult {
  step: number;
  name: string;
  prd_req: string;
  passed: boolean;
  details: string;
  log_output: string;
}
