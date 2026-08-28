# PRD v1 — AI Fleet Disruption & Voyage Recovery Orchestrator

**Organization:** Maritime Fleet Operations (fictional multinational fleet operator)  
**Status:** fully worked workshop demonstration; synthetic data only  
**Upstream source of truth:** approved Stage 1–8 decisions in `Qwen_markdown_20260828_twiw1o6c9.md` and `Participant_Case_Study_Stages_1_to_8_and_Build.docx`  
**Implementation:** `reference_app/`

---

## 1. Product intent

Fragmented disruption-to-recovery workflows across 32 vessels create repeated manual context gathering, constraint reconciliation, duplicate event handling and inconsistent decision rationale. The orchestrator reduces recovery-planning burden while preserving Master navigational authority, offline vessel continuity, deterministic deduplication, satellite/AI cost constraints and vessel-to-shore traceability.

### Goals
- Reduce median disruption-to-recovery-plan time from **94 minutes to <45 minutes** in the workshop benchmark.
- Reduce manual duplicate reconciliation effort from **14.8% to <2%**.
- Reduce late-constraint plan revision rate from **22.1% to <5%**.
- Make every surfaced AI-assisted fact traceable to source evidence with freshness and confidence.
- Preserve explicit human authority for recovery plan approval, safety override and navigational command.
- Maintain 100% essential vessel-side workflow continuity during satellite blackout.

### Non-goals / prohibited authority
- No autonomous navigation command or route planning authority.
- No autonomous recovery action execution without Master/Fleet Operations Centre approval.
- No commercial chartering negotiation or crew HR decision authority.
- No physical maintenance work authorization (CMMS informs planning only).
- No real production vessel/crew/cargo data in this demo.
- No claim that AI constraints override safety/regulatory or Master authority.

---

## 2. Constraint validation contract

For the workshop, deterministic constraint validation checks the non-negotiable case boundaries represented in the source exercise: **Master authority preserved, offline continuity maintained, duplicate events idempotently handled, provenance visible for every recommendation, and safety/regulatory constraints override commercial optimization**. AI may propose contextual information and recovery option drafts but may not invent missing constraints or override deterministic safety limits. Only options explicitly approved by authorized authorities count as committed in the demo.

Production implementation would require organization/SOP/jurisdiction-specific validation, flag-state regulatory interpretation and controlled authority/licensing decisions.

---

## 3. Users, decision rights and role matrix

| Role | View disruption | Review context/impact | Approve recovery plan | Override safety constraint | View provenance | Record rationale | Export audit |
|---|---:|---:|---:|---:|---:|---:|---:|
| Master (Vessel) | Yes | Yes | Yes | Yes (within COLREGs) | Yes | Yes | Yes |
| Fleet Operations Desk | Yes | Yes | Yes (shore-side) | No | Yes | Yes | Yes |
| Bridge Team | Yes | Yes | No | No | Yes | Yes | No |
| Port/Cargo/Crew Coordinator | Yes | Yes (constraints only) | No | No | Yes | No | No |
| Safety/Compliance Observer | Yes | No | No | No | Yes | No | Yes |

The UI is not the security boundary in a production system; server/API authorization with vessel/shore tenant isolation would be required. The reference app centralizes the role/action policy so forbidden writes are testable.

---

## 4. Core workflows

**WF-01 Disruption detection & durable capture:** vessel event/telemetry received → deterministic deduplication via edge spool → disruption record created with sequence ID → state machine advances.

**WF-02 Impact assessment & context gathering:** AI-assisted information synthesis assembles vessel state, weather, ocean, port, cargo, crew, CMMS context with provenance and freshness → deterministic constraint solver validates feasibility → authorized user reviews.

**WF-03 Recovery option generation:** constrained AI drafts recovery options using RAG-grounded evidence only → deterministic solver pre-filters against CMMS/weather/port/safety constraints → options show confidence, source freshness and unavailable constraints.

**WF-04 Master/Fleet approval:** evidence-rich UI presents options with provenance trace → Master or Fleet Operations Desk records approval/disposition with rationale → no autonomous commit.

**WF-05 Controlled execution & monitoring:** approved recovery action committed to durable state → execution tracked → vessel/shore state synchronized on reconnect.

**WF-06 Offline continuity:** during satellite blackout, essential vessel-side workflow continues on edge state machine → local constraint checking → local rationale recording → deterministic sync on reconnect.

**WF-07 Manual fallback:** when AI assistance is disabled/unavailable, manual context review, constraint checking, option drafting, approval recording and audit remain available.

**WF-08 Audit & traceability:** authorized user can reconstruct disruption lifecycle, before/after actions, material versions, provenance chain and export the synthetic review package.

---

## 5. Functional requirements

| ID | Requirement | Acceptance evidence | Upstream trace |
|---|---|---|---|
| FR-001 | Show disruption queue with vessel, event type, received time/SLA age, connectivity status and deterministic deduplication state. | Queue renders all seeded disruptions and opens workspace. | Stages 2, 3, 5 |
| FR-002 | Show source evidence (telemetry, AIS, weather, port, cargo, crew, CMMS) with confidence, provenance, freshness status and review controls. | Every surfaced context item has evidence link(s), source authority and timestamp. | Stages 5, 6, 7 |
| FR-003 | Persist event `deduplicated`, `new`, `reconciled` status plus sequence ID, reviewer/time in state and audit. | State changes survive screen re-render, edge restart and appear in export/audit. | Stages 5, 7 |
| FR-004 | Deterministically evaluate constraints over verified evidence only; safety/regulatory constraints override commercial optimization. | Proposed/rejected/missing constraints do not count toward feasibility. | Stages 5, 7 |
| FR-005 | Show recovery option candidates with match evidence, constraint validation result and unavailable-source warnings; persist explicit approval/disposition; never auto-execute. | No automatic execution path exists; every commit requires human approval. | Stages 4, 5, 7 |
| FR-006 | Show AI-synthesized context summaries in constrained mode and support human/manual context review. | Synthesis persists/audits; manual review works with AI off. | Stages 4, 5, 7 |
| FR-007 | Generate recovery options only when minimum criteria are complete; use accepted facts and known evidence IDs; reject unknown evidence references. | Generation blocked when criteria incomplete; unknown evidence reference is rejected on save/approve. | Stages 5, 7 |
| FR-008 | Preserve manual workflow when AI is disabled or satellite is unavailable. | AI candidate/generation controls unavailable; manual actions remain role-authorized. | Stages 4, 7, 8 |
| FR-009 | Record user role, timestamp, action, target, before/after, reason where applicable and app/model/prompt/policy/constraint-solver versions. | Audit rows/export contain these fields. | Stages 6, 7, 8 |
| FR-010 | Master or Fleet Operations Desk only can approve a recovery plan; Safety/Compliance Observer is read-only except export. | Negative authorization tests pass. | Stages 5, 7 |
| FR-011 | Compute evaluation PASS/FAIL from metric values/operators/thresholds against baseline. | Changing a fixture above threshold produces FAIL in domain test. | Stage 7 |
| FR-012 | Show risk/control mapping with status and owner. | Risk dashboard renders risk, control, owner/status. | Stage 7 |
| FR-013 | Export mutated synthetic disruption state, audit, evaluations, provenance chain and material versions as JSON. | Export payload contains current state, not only original fixtures. | Stages 6, 7 |
| FR-014 | Handle duplicate event delivery idempotently; duplicate events must not create duplicate operational actions. | Duplicate event flood test produces single operational action. | Stages 3, 7 |
| FR-015 | Support offline essential workflow with edge state machine and deterministic sync on reconnect. | Satellite blackout scenario test passes; state reconciles correctly. | Stages 2, 7, 8 |

---

## 6. Non-functional requirements

- **NFR-001 Resilience:** manual disruption-processing path remains available when AI assistance or cloud connectivity is disabled.
- **NFR-002 Traceability:** AI-assisted facts/drafts carry evidence IDs, source authority, original timestamp, version, transformation trace and freshness status (Fresh, stale, expired, unknown).
- **NFR-003 Authorization:** forbidden role/action combinations are blocked by centralized policy; production would require equivalent server-side enforcement with vessel/shore tenant isolation.
- **NFR-004 Privacy:** synthetic data only; no default external API or telemetry dependency; crew/cargo data handled per purpose-limitation rules.
- **NFR-005 Reproducibility:** seeded fixtures, versioned evaluation set, deterministic threshold comparison and synthetic golden scenarios.
- **NFR-006 Accessibility:** semantic HTML, labels and keyboard-usable controls; production requires formal accessibility testing.
- **NFR-007 Local performance:** normal local interactions should remain sub-second; production SLAs are an open decision.
- **NFR-008 Recoverability:** state export provides workshop evidence; production persistence/backup/RPO/RTO are open decisions.
- **NFR-009 Cost constraint:** satellite and AI usage must not exceed baseline + 10%; verbose LLM payloads must be bounded.
- **NFR-010 Idempotency:** at-least-once event delivery must be reconciled deterministically without duplicate operational actions.

---

## 7. Data/provenance contracts

Core entities: `DisruptionEvent`, `VesselState`, `EvidenceItem`, `ConstraintSet`, `RecoveryOption`, `ApprovalRecord`, `AuditEvent`, `EvalFixture`, `RiskControl`, `SyncRecord`.

Every surfaced context item stores: value, confidence, source evidence IDs, source authority, original timestamp, version, transformation trace, freshness status, reviewer and review time. Every evidence item stores a source, locator, received time and evidence text. Every audit event stores before/after and material versions. Every recovery option stores: constraint validation result, unavailable constraints list and evidence references.

**Permission invariant:** availability is not permission. The demo uses synthetic fixtures only. Production access/reuse/training permissions require explicit Stage 6 evidence and approval. UNKNOWN, CONDITIONAL or RESTRICTED never means "allowed by default."

---

## 8. Evaluation requirements

| Metric / control | Workshop threshold |
|---|---:|
| Disruption-to-recovery-plan median time | <45 min (vs. baseline 94 min) |
| Disruption-to-recovery-plan P90 time | <120 min (vs. baseline 286 min) |
| Manual duplicate reconciliation rate | <2% (vs. baseline 14.8%) |
| Late-constraint plan revision rate | <5% (vs. baseline 22.1%) |
| Incomplete rationale trace rate | <2% (vs. baseline 18.4%) |
| Surfaced recommendations with provenance | 100% |
| Automatic recovery action executions | 0 |
| AI hallucination of port/berthing constraints | <1% (kill threshold: >5%) |
| Offline continuity (essential workflow) | 100% |
| Duplicate event → duplicate operational action | 0 |
| Successful unauthorized role actions | 0 |
| Manual fallback | All declared fallback scenarios pass |
| Satellite/AI cost vs. baseline | ≤+10% |

Thresholds are workshop design decisions, not external regulatory guarantees. Production thresholds, confidence intervals and statistical margins must be approved by accountable fleet operations/safety/risk roles.

---

## 9. Risks and controls

- **Unsupported generated fact** → accepted-evidence-only synthesis + evidence IDs + evidence-reference validation + human approval gate.
- **Missing constraint evidence** → deterministic constraint solver gate; AI cannot invent absent safety/regulatory/port/CMMS constraints.
- **Wrong recovery option selection** → ranked candidates with constraint validation; explicit approval/disposition; no auto-execution.
- **AI hallucination of port/weather constraints** → RAG-grounded retrieval only; deterministic solver validation; kill criterion >5% hallucination rate.
- **Unauthorized execution** → centralized role/action policy + negative tests; Master/Fleet Operations Desk approval required.
- **Silent version drift** → app/model/prompt/policy/constraint-solver/golden-set versions in audit/export.
- **AI/cloud outage** → manual mode + edge state machine + offline essential workflow.
- **Duplicate event flood** → deterministic idempotency via sequence IDs; duplicate events must not create duplicate operational actions.
- **Vessel/shore state divergence** → edge-first durable spool; deterministic sync on reconnect with conflict resolution.
- **Sensitive-data misuse** → synthetic demo only; production permissions remain OPEN_DECISIONS until approved; crew/cargo data purpose-limited.
- **Satellite cost overrun** → bounded LLM payload size; constrained AI usage; cost monitoring with rollback trigger.

---

## 10. Screens

1. Disruption Queue / Fleet Command Center
2. Vessel Workspace + Evidence Drawer (telemetry, AIS, weather, port, cargo, crew, CMMS)
3. Impact Assessment & Constraint Validation
4. Recovery Option Review & Approval
5. Execution Monitor & Replan View
6. Evaluation Dashboard
7. Risk & Controls
8. Audit Explorer / Export
9. Offline Mode Indicator & Sync Status

---

## 11. Test obligations

Before claiming completion:
- deterministic domain-rule unit tests pass (constraint solver, deduplication, approval gate);
- unauthorized-action negative tests pass;
- minimum-criteria incomplete/complete cases pass;
- grounded recovery option known/unknown evidence-reference tests pass;
- duplicate event flood → single operational action test passes;
- satellite blackout → offline continuity → reconnect sync test passes;
- calculated threshold tests pass (median <45 min, duplicate rate <2%, etc.);
- manual mode is demonstrable with AI disabled;
- export contains mutated state, audit, provenance chain and versions.

---

## 12. OPEN_DECISIONS for any production implementation

- Final EU AI Act classification based on jurisdiction/actor/product role (Legal/compliance).
- AIS licensing and derived-data rights (Legal/data owner).
- Runtime model provider approval, if AI runtime is used (AI governance/security).
- Production cost budget for satellite/AI usage (VP Fleet Operations).
- Applicable flag-state/jurisdiction-specific regulatory interpretation and Master authority scope.
- Organization SOP wording, workflow states, decision authorities and required signatures.
- Real vessel telemetry, port, weather, CMMS and cargo-system integration contracts.
- Real crew/cargo data lawful basis, minimization, retention, residency and model-improvement permissions.
- Production authentication/authorization, key management, encryption, audit immutability and separation of duties.
- Validated production thresholds, subgroup/rare-case statistical power and release governance.
- Availability, RPO/RTO, incident/recall/rollback and business-continuity requirements.
- Production model/provider and change-control/validation approach.
- Edge hardware specification, SQLite schema evolution and vessel-side deployment pipeline.

---

## 13. Traceability rule

No implementation feature may appear without an upstream Stage 1–8 decision. Missing decisions become `OPEN_DECISIONS`; they are never silently completed by Qwen, Qwen Code, Google AI Studio Build mode or another coding agent.

Every product feature must map to a domain capability/rule from Stage 5 and permitted data from Stage 6. Every AI behavior must map to an evaluation scenario/threshold and a risk/oversight control from Stage 7. Every architecture/component choice must map to the selected option and preliminary ADRs from Stage 8.

---

**End of PRD v1**
