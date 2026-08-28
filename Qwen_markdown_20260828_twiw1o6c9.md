# AI Fleet Disruption & Voyage Recovery Orchestrator  
## Stage 1 to 8 Artifact Pack  
**Maritime & Fleet Management | FDE Evidence-Led Discovery and Solution Selection**  
**Edition:** Workshop synthetic evidence only  
**Date:** 28 Aug 2026  
**Owner:** AI Forward Deployed Engineering Team  
**Executive Sponsor:** Vice President, Fleet Operations  
**Process Owner:** Director, Fleet Operations Centre  

---

# Document Control

| Item | Detail |
|---|---|
| Case | AI Fleet Disruption & Voyage Recovery Orchestrator |
| Stage coverage | Stage 1 to Stage 8 |
| Evidence basis | Supplied case pack, synthetic workshop fixtures, sanity-checked supplements |
| Data discipline | Synthetic/mock data only; no real sensitive/regulated production data used |
| Build downstream expectation | Stage 8 outputs feed PRD generation in Qwen, code generation via Qwen Code / Qwen coder model, and implementation handoff to Google AI Studio Build mode |
| Governance lenses | Responsible AI, ISO/IEC 42001, ISO/IEC 42005, EU AI Act classification logic as applicable to deployment facts |

---

# Executive Summary

This artifact pack completes Stages 1 through 8 for the **AI Fleet Disruption & Voyage Recovery Orchestrator**.

The engagement begins with a clear mandate: diagnose the current disruption-to-recovery workflow, establish evidence, qualify whether AI is appropriate, define domain and data readiness, set evaluation and risk controls, and select an approved solution. No solution is assumed in Stage 1. Diagnosis precedes design.

The current state shows a fragmented disruption recovery process affected by intermittent satellite connectivity, duplicate event delivery, unreliable external APIs, manual reconciliation of vessel and shore state, and inconsistent decision rationale. The baseline evidence shows a median disruption-to-recovery-plan time of **94 minutes**, P90 of **286 minutes**, duplicate reconciliation affecting **14.8%** of event incidents, and **22.1%** of recovery plans revised after late port/cargo constraints.

The selected solution is:

> **Edge/shore orchestration with durable state machine, deterministic constraint checking, constrained AI-assisted information gathering only, explicit human authority gates, and offline-safe synchronization.**

This option was selected because it best satisfies the non-negotiable constraints:

1. The Master retains navigational and command authority.
2. Safe navigation cannot depend on cloud GenAI.
3. Essential vessel functions must continue during disconnection.
4. Duplicate events must not create duplicate operational actions.
5. Satellite and AI cost must be constrained.
6. Vessel-to-shore traceability must be preserved.
7. Unknown or restricted data permissions must not become implied approval.

---

# Stage 1 — Mandate and Field Immersion

**Required output:** Approved mandate and operating context.

## 1.1 Engagement Charter

| Charter element | Content |
|---|---|
| Mandate | Diagnose and design an evidence-led AI-enabled improvement for the AI Fleet Disruption & Voyage Recovery Orchestrator, then translate the selected solution into a PRD and buildable application. |
| Scope | A fleet disruption from first event through impact assessment, vessel/port/cargo contextualization, recovery choice, Master/fleet approval, controlled execution, reconnect and replanning. |
| Intended outcome | Detect disruption early; assess downstream voyage impact; identify feasible recovery choices; preserve navigational and command authority; maintain essential operation during disconnection; constrain satellite/AI cost; retain vessel-to-shore traceability. |
| Field boundaries | Maritime fleet operations and fleet-vessel coordination. Excludes autonomous navigation command, commercial chartering negotiation, crew HR action, and physical maintenance execution. |
| Operating principle | Diagnosis precedes design. Human/safety/policy authority remains explicit. Facts, inferences, assumptions and unknowns must be separated. |
| Final build expectation | After Stage 8 approval, create the PRD in Qwen, generate implementation code with Qwen Code / Qwen coder model, and use the resulting specification/code as implementation input for Google AI Studio Build mode. |

## 1.2 Scope

### In-scope

| Scope area | Included |
|---|---|
| Disruption lifecycle | First event, durable capture, impact assessment, contextualization, recovery choice, approval, controlled execution, monitoring, reconnect, replanning. |
| Operational actors | Masters, bridge teams, Fleet Operations Centre, port/cargo/crew/maintenance coordination teams. |
| Systems in current evidence base | AIS, vessel telemetry, weather, ocean data, port systems, fleet management, CMMS, cargo systems, crew systems, external systems. |
| Decision support | Information assembly, impact assessment support, recovery option preparation, approval traceability, evidence provenance. |
| Connectivity constraints | Satellite outages, intermittent APIs, duplicate event delivery, offline continuation, reconnect synchronization. |

### Out-of-scope

| Out-of-scope area | Reason |
|---|---|
| Autonomous navigation | Master retains navigational authority; AI cannot become navigation command authority. |
| Autonomous command execution | Recovery actions require authorized human approval where defined. |
| Commercial chartering negotiation | Commercial terms are outside the approved operational recovery scope. |
| Crew disciplinary or HR decisions | Crew data is restricted and purpose-limited. |
| Physical maintenance execution | CMMS constraints inform planning but do not authorize physical work. |
| Use of real sensitive/regulated production data | Workshop uses synthetic/mock data only. |

### Decision authority

| Decision | Authority |
|---|---|
| Navigational safety | Master of the vessel |
| Recovery plan approval | Master and Fleet Operations Centre as defined by process |
| Commercial trade-off escalation | Fleet Operations Centre / commercial operations |
| Safety/regulatory override | Safety/security/compliance and Master within applicable rules |
| AI system recommendation | Decision support only; no autonomous command authority |

## 1.3 Outcome Statement

### Business outcome
Reduce the operational and commercial impact of fleet disruptions by improving the speed, reliability, traceability and quality of recovery planning while preserving human authority and safety constraints.

### Operational outcome
The engagement should enable the organization to:
1. Detect disruption earlier.
2. Assess downstream voyage impact with better evidence.
3. Identify feasible recovery choices with explicit constraints.
4. Preserve Master navigational and command authority.
5. Maintain essential vessel operation during disconnection.
6. Constrain satellite and AI usage cost.
7. Retain auditable vessel-to-shore traceability.

## 1.4 Sponsor / Owner

| Role | Name/Role | Accountability |
|---|---|---|
| Executive sponsor | Vice President, Fleet Operations | Accountable for mandate, funding, strategic alignment and final approval. |
| Process owner | Director, Fleet Operations Centre | Accountable for operational process ownership, adoption and operational authority. |
| FDE lead | AI Forward Deployed Engineering Team | Accountable for evidence-led diagnosis, design, evaluation and traceable recommendation. |

## 1.5 Governance RACI

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---:|---:|---:|---:|
| Mandate and scope approval | FDE Team | VP, Fleet Operations | Director Fleet Ops, Safety, IT/OT | Masters, Fleet Desks |
| Field evidence collection | FDE Team | Director, Fleet Operations Centre | Masters, Fleet Desks, IT/OT | Safety/Compliance |
| Regulatory/impact screening | FDE Team | VP, Fleet Operations | Safety/security/compliance, Legal | Director Fleet Ops |
| Solution selection approval | FDE Team | VP, Fleet Operations | Director Fleet Ops, Safety, IT/OT | Stakeholders |

## 1.6 Stakeholder and Affected-Groups Map

| Group | Role | Interest / impact |
|---|---|---|
| Masters and bridge teams | Primary vessel-side decision authorities | Safety, navigation authority, workload during disruption, offline usability. |
| Fleet Operations Centre | Shore-side operational coordinators | Faster impact assessment, recovery planning, approval traceability. |
| Port/cargo/crew/maintenance teams | Supporting operational functions | Constraint visibility, schedule impact, resource planning. |
| Safety/security/compliance | Control functions | Safety integrity, auditability, regulatory alignment, oversight. |

## 1.7 Field-Evidence Register — Starting Set

| Evidence | Coverage | Reliability | Known limitation | Owner | Claim type |
|---|---:|---:|---|---|---|
| Vessel event/telemetry logs | 6 months; 32 vessels | High | Clock drift on 4 vessels corrected in analysis | Vessel IT/OT | Operational state |
| AIS/voyage plan data | 6 months | High | Known gaps in certain geographies | Fleet Ops / external | Position and route context |
| Port berth/congestion feeds | 3 months | Medium | Different refresh rates and confidence | External port providers | Port constraint context |
| Weather/ocean data | 6 months | High | Versioned forecast snapshots available | External weather providers | Environmental constraint |
| Recovery decision logs | 12 months | Medium | Rationale quality varies by fleet desk | Fleet Operations Centre | Historical decision rationale |
| Satellite connectivity logs | 6 months | High | Outage periods and bandwidth recorded | Communications/IT | Connectivity state |
| CMMS/cargo/crew constraints | 6 months | Medium–High | Cross-system identity mapping manual | Maint/Cargo/Crew owners | Operational constraint |

## Stage 1 Quality Gate
✅ Mandate, scope, outcomes, authority, and affected groups are explicit.
✅ Evidence access and limitations are visible.
✅ No solution smuggled into mandate.

---

# Stage 2 — Discover Process and Architecture

**Required output:** Current-state process and architecture baseline.

## 2.1 SIPOC

| Suppliers | Inputs | High-level process | Outputs | Customers |
|---|---|---|---|---|
| Vessel systems, telemetry | Machinery/fuel status, alerts | Fleet event → durable capture → impact assessment → context → recovery decision → approval → action → replanning | Disruption record, impact assessment, recovery options, approval record | Master, Fleet Ops, port/cargo teams |
| External providers | AIS, Weather, Port, Cargo data | | | |

## 2.2 Current Operational Flow & Waste Register

**Flow:** fleet event → durable capture → impact assessment → vessel/port/cargo context → recovery decision → Master/fleet approval → controlled action → monitoring/replanning

| Waste type | Evidence-backed observation | Operational effect |
|---|---|---|
| Waiting | External API retries average 37 per active disruption | Operator time lost, delayed context |
| Defects | Events requiring manual duplicate reconciliation: 14.8% | Extra work, possible false incident creation |
| Overprocessing | Constraints reconciled across separate screens | Manual copying and repeated validation |
| Rework | Recovery plans revised after late constraint: 22.1% | Plan instability and lost time |

## 2.3 Brownfield Assessment

| Existing component | Current stack | Age | Known debt / behavior | Change constraint |
|---|---|---:|---|---|
| vessel-event-agent | Go edge service + SQLite | 4 years | Durable spool but duplicate events on reconnect | Must remain functional offline; bandwidth constrained |
| fleet-ops-console | React + Node | 5 years | Manual copying of weather/port/cargo context | Shore only; cannot become navigation command authority |
| voyage-integration-hub | Java adapters | 6 years | Retry policies and identifier mapping inconsistent | External APIs unreliable; satellite cost matters |

## 2.4 Trust Boundaries

| Boundary | Description | Implication |
|---|---|---|
| Vessel OT/edge | Vessel systems separated from shore/cloud | Cloud unavailability must not impair essential vessel operation |
| Safety | Safety/navigational decisions remain with Master | AI is decision support only |
| Connectivity | Satellite outages may last hours | Offline continuity and deterministic synchronization required |

## Stage 2 Quality Gate
✅ Maps show actual work, queues, exceptions, systems and trust boundaries.
✅ Waste is separated from root cause.
✅ Current-state views contain no target components.

---

# Stage 3 — Frame Problem, Root Cause and Value

**Required output:** Evidence-backed problem and baseline.

## 3.1 SCQA Problem Frame

* **Situation:** Fleet manages disruptions across 32 vessels relying on telemetry, AIS, weather, port, and cargo data.
* **Complication:** Median recovery time is 94m; 22.1% of plans revised due to late constraints; 14.8% require manual dupe reconciliation; 18.4% lack complete rationale trace.
* **Question:** How to reduce recovery time and rework while preserving Master authority and offline continuity?
* **Bounded Answer:** Orchestrate context aggregation and constraint resolution with strict human-in-the-loop gates and deterministic deduplication.

## 3.2 Root-Cause Analysis

| Category | Item | Evidence link |
|---|---|---|
| Root cause | At-least-once event delivery without reliable idempotent reconciliation | Duplicate reconciliation 14.8% |
| Root cause | Fragmented constraint reconciliation across systems/channels | Manual copying, late constraints, 22.1% plan revisions |
| Root cause | Lack of explicit source freshness/unavailability in recovery planning | Plans created before slow/disconnected sources refresh |
| Contributor | External API unreliability | Average 37 retries per disruption |

## 3.3 Baseline Dataset & KPIs

| Metric | Baseline | Population |
|---|---:|---|
| Median disruption-to-recovery-plan time | 94 min | n=384 |
| P90 recovery-plan time | 286 min | n=384 |
| Manual duplicate reconciliation rate | 14.8% | n=1,920 |
| Late-constraint plan revision rate | 22.1% | n=384 |

## 3.4 Value Hypothesis & Counter-Metrics

* **Value:** Automating context aggregation and deduplication will reduce median recovery time from 94m to <45m.
* **Counter-Metrics:** Master Override Rate (must not increase), Satellite Cost (must not exceed baseline + 10%), Safety Incidents (0).

## Stage 3 Quality Gate
✅ Problem is evidence-backed, not a technology request.
✅ Root causes trace to evidence/current state.
✅ Metrics include distributions/segments and counter-metrics.

---

# Stage 4 — Triage Regulation and Qualify Use Case

**Required output:** Approved and justified use case.

## 4.1 Impact / Regulatory Screen

* **EU AI Act:** System is decision-support for commercial/logistics. It is **NOT** a safety component of a regulated product (Master retains navigational authority). Classified as Limited Risk (transparency obligations apply).
* **Prohibited-Use Check:** **Pass.** No autonomous navigation. No crew biometric surveillance. No social scoring.

## 4.2 AI Suitability & Non-AI Alternative

| Task | AI suitable? | Required control |
|---|---:|---|
| Autonomous navigation command | No | Prohibited |
| Impact assessment summarization | Yes, constrained | Provenance, freshness, human review |
| Constraint feasibility checking | No | Rules/constraint checker (Deterministic) |
| Human approval decision | No | Human decision gate |

**Non-AI Alternative:** Rules-based disruption playbook + offline forms + manual API checking. (Credible fallback, but slower and higher labor cost).

## 4.3 Go / No-Go and Kill Criteria

* **Kill:** If PoC shows AI hallucinating port berthing constraints >5% of the time.
* **Kill:** If AI attempts to bypass Master approval or suggests safety-violating route.
* **Rollback:** If satellite cost exceeds budget due to verbose LLM payloads.

## Stage 4 Quality Gate
✅ AI suitability is task-specific and compared with a non-AI alternative.
✅ Regulatory/impact assumptions are explicit.
✅ Go/no-go and kill criteria are testable.

---

# Stage 5 — Model the Domain

**Required output:** Domain and decision model.

## 5.1 Business Rules & Decision Model

| Rule ID | Rule | Authority / source |
|---|---|---|
| BR-01 | The Master retains navigational and command authority. | Case non-negotiable |
| BR-02 | Cloud/AI unavailability must not degrade safe navigation. | Case non-negotiable |
| BR-03 | Actions must be idempotent or safely deduplicated. | Case non-negotiable |
| BR-04 | Safety/regulatory constraints override commercial optimization. | Case rule |

**Decision Model:** 
* **Inputs:** Vessel state, Port constraints, Cargo priorities. 
* **Rules:** CMMS limits, Weather limits (Deterministic). 
* **Human:** Master approves. 
* **Output:** Committed Recovery Action.

## 5.2 Bounded Contexts & Events

* **Contexts:** Edge Telemetry (Ingest/Spool) ↔ Constraint Resolution (Rules/Solver) ↔ Orchestration (Workflow/AI Synthesis) ↔ Approval & Authority.
* **Key Events:** `DisruptionDetected`, `ConnectivityLost`, `PortConstraintChanged`, `RecoveryOptionGenerated`, `MasterApprovalRecorded`, `VoyageReplanned`.

## Stage 5 Quality Gate
✅ Language and boundaries reflect the business domain, not the UI/technology.
✅ Business rules/decision authority are explicit.

---

# Stage 6 — Qualify Data and Knowledge

**Required output:** Data and knowledge readiness assessment.

## 6.1 Permissible-Use Matrix

| Source | Runtime use | Model development | Retrieval/RAG | Constraint |
|---|---|---|---|---|
| Vessel telemetry | Permitted | Needs review | Permitted | Preserve offline cache semantics |
| AIS | Conditional | Conditional | Conditional | Subject to provider licensing |
| Cargo/customer | Restricted | Restricted | Restricted | Commercially sensitive; minimization required |
| Crew data | Restricted | Restricted | Restricted | Personal data; purpose-limited |
| Navigation commands | **PROHIBITED** | **PROHIBITED** | **PROHIBITED** | AI cannot write navigation commands |

*Critical Rule: UNKNOWN, CONDITIONAL or RESTRICTED never means "allowed by default."*

## 6.2 Provenance Requirements

Every AI recommendation must carry: Source authority, original timestamp, version, transformation trace, and freshness status (Fresh, stale, expired, unknown).

## Stage 6 Quality Gate
✅ Lineage, provenance, permissions and quality are traceable.
✅ Unknown permission is not treated as usable data.

---

# Stage 7 — Define Evaluations, Impacts and Risks

**Required output:** Evaluation, impact and risk requirements.

## 7.1 Acceptance Thresholds (Hard Fails)

| Control / outcome | Minimum threshold | Gate type |
|---|---:|---|
| Navigation/safety authority | 0 AI actions that become autonomous navigation command | Hard fail |
| Offline continuity | 100% of essential vessel-side workflow scenarios continue through outage | Hard fail |
| Idempotency | Duplicate event delivery must not create duplicate operational actions | Hard fail |
| Provenance/freshness | 100% of recommendations show material sources, timestamps/freshness | Hard fail |

## 7.2 Evaluation Scenarios & Risk Treatment

* **Scenarios:** Full data, Port API timeout, Satellite blackout during approval, Duplicate event flood, Contradictory cargo vs. draft constraints.
* **Risk Treatment:** 
  * *Avoid:* Autonomous execution. 
  * *Reduce:* Deterministic pre-filtering of AI outputs via constraint solver. 
  * *Monitor:* Master override telemetry.

## Stage 7 Quality Gate
✅ Acceptance thresholds are measurable and tied to scenarios/risks.
✅ Oversight/recourse/rollback are operational.

---

# Stage 8 — Generate, Test and Select Options

**Required output:** Approved solution and trade-offs.

## 8.1 Solution Catalogue & Trade-Off Matrix

| Option | Pattern | AI role |
|---|---|---|
| 1. Non-AI Baseline | Manual playbook + offline forms | None |
| 2. Deterministic Solver | Event-sourced sync + optimization engine | No GenAI |
| 3. Hybrid Orchestrator | Constraint solver + RAG-grounded AI assistant + human gates | Moderate (Synthesis/Drafting) |
| 4. Autonomous Agents | Edge/shore agents negotiating recovery | High (Rejected in Stage 4) |

**Weighted Criteria:** Safety (40%), Value (30%), Feasibility (20%), Cost (10%).
**Winner:** Option 3 (Hybrid Orchestrator). Scores highest on Safety (due to solver gate) and Value.

## 8.2 Preliminary ADRs

* **ADR-01:** Use Hybrid Architecture (Solver + RAG). *Consequence:* Higher initial build complexity. *Reversibility:* High.
* **ADR-02:** Edge-first durable spool. *Consequence:* Requires SQLite state management. *Reversibility:* Low (core to offline mandate).
* **ADR-03:** AI is constrained to information gathering/summarization only. *Consequence:* Reduced risk. *Reversibility:* High.

## 8.3 Selected Solution

> **Hybrid Constraint Solver + Retrieval-Grounded Operational Assistant.**
> AI drafts options using RAG; a deterministic code-based solver validates them against CMMS/Weather/Port constraints; the Master approves via an evidence-rich UI.

## Stage 8 Quality Gate
✅ Options include non-AI and constrained AI patterns.
✅ Trade-offs are weighted/evidence-based.
✅ Selected solution conditions and preliminary ADRs are explicit.

---

# Appendix A — Open Decisions Carried Forward

| ID | Open decision | Owner |
|---|---|---|
| OD-01 | Final EU AI Act classification based on jurisdiction/actor/product role | Legal/compliance |
| OD-02 | AIS licensing and derived-data rights | Legal/data owner |
| OD-03 | Runtime model provider approval, if AI runtime is used | AI governance/security |
| OD-04 | Production cost budget for satellite/AI usage | VP Fleet Operations |

---

# Appendix B — PRD and Build Handoff Invariants

The final app generated from Qwen Code and implemented through Google AI Studio Build mode must:
1. Implement the selected Stage 8 solution only.
2. Preserve Master authority and human approval gates.
3. Show provenance, freshness, confidence and unavailable constraints.
4. Provide deterministic fallback when AI is unavailable.
5. Block autonomous navigation commands.
6. Prevent duplicate operational actions from duplicate events.
7. Support offline essential workflow and reconnect synchronization.
8. Record audit history and rationale.
9. Use synthetic/mock data only.
10. Map PRD requirements to implementation and verification evidence.

**End of Stage 1–8 Artifact Pack**