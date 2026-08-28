import {
  Vessel,
  DisruptionEvent,
  EventStatus,
  FreshnessStatus,
  EvidenceItem,
  Constraint,
  RecoveryOption,
  Role
} from "../types/orchestrator";

export const INITIAL_VESSELS: Vessel[] = [
  {
    id: "V-ALPHA",
    name: "MV Alpha Star",
    imo: "IMO 9842104",
    callsign: "9V8841",
    flag: "Singapore 🇸🇬",
    type: "Ultra Large Container Vessel (20,000 TEU)",
    current_draft_m: 11.8,
    max_draft_m: 12.5,
    speed_knots: 17.4,
    lat: 21.32,
    lng: 121.15,
    origin_port: "Shanghai, China (CNSHA)",
    destination_port: "Rotterdam, Netherlands (NLRTM)",
    eta: "2026-09-12 14:00 UTC",
    bunker_remaining_pct: 68,
    status: "DISRUPTED",
    active_disruption_id: "evt-typhoon-luzon"
  },
  {
    id: "V-PACIFIC",
    name: "MV Pacific Voyager",
    imo: "IMO 9763321",
    callsign: "V7XY9",
    flag: "Marshall Islands 🇲🇭",
    type: "VLCC Crude Carrier (300,000 DWT)",
    current_draft_m: 12.4,
    max_draft_m: 12.5,
    speed_knots: 13.8,
    lat: 1.25,
    lng: 103.88,
    origin_port: "Ras Tanura, Saudi Arabia (SARAS)",
    destination_port: "Singapore Jurong (SGSIN)",
    eta: "2026-08-29 08:30 UTC",
    bunker_remaining_pct: 42,
    status: "DISRUPTED",
    active_disruption_id: "evt-singapore-berth"
  },
  {
    id: "V-HORIZON",
    name: "MV Northern Horizon",
    imo: "IMO 9918450",
    callsign: "C6DJ3",
    flag: "Bahamas 🇧🇸",
    type: "Capesize Bulk Carrier (180,000 DWT)",
    current_draft_m: 10.5,
    max_draft_m: 12.5,
    speed_knots: 11.2,
    lat: -14.2,
    lng: 62.4,
    origin_port: "Port Hedland, Australia (AUPHE)",
    destination_port: "Qingdao, China (CNTAO)",
    eta: "2026-09-04 18:00 UTC",
    bunker_remaining_pct: 79,
    status: "DISRUPTED",
    active_disruption_id: "evt-engine-derating"
  },
  {
    id: "V-ATLANTIC",
    name: "MV Atlantic Coral",
    imo: "IMO 9645512",
    callsign: "ZDLE4",
    flag: "Liberia 🇱🇷",
    type: "LNG Tanker (174,000 m³)",
    current_draft_m: 9.8,
    max_draft_m: 12.0,
    speed_knots: 18.5,
    lat: 36.2,
    lng: -4.8,
    origin_port: "Corpus Christi, USA (USCRP)",
    destination_port: "Marseille, France (FRMRS)",
    eta: "2026-08-31 06:00 UTC",
    bunker_remaining_pct: 88,
    status: "NORMAL"
  },
  {
    id: "V-PHOENIX",
    name: "MV Orient Phoenix",
    imo: "IMO 9820019",
    callsign: "3ELM9",
    flag: "Panama 🇵🇦",
    type: "Post-Panamax Container (14,500 TEU)",
    current_draft_m: 12.1,
    max_draft_m: 12.5,
    speed_knots: 16.0,
    lat: 12.6,
    lng: 44.3,
    origin_port: "Ningbo, China (CNNGB)",
    destination_port: "Felixstowe, UK (GBFXT)",
    eta: "2026-09-18 20:00 UTC",
    bunker_remaining_pct: 54,
    status: "NORMAL"
  }
];

export const INITIAL_DISRUPTIONS: DisruptionEvent[] = [
  {
    id: "evt-typhoon-luzon",
    idempotency_key: "idemp-typhoon-luzon-20260828",
    vessel_id: "V-ALPHA",
    vessel_name: "MV Alpha Star",
    event_type: "WEATHER_DEVIATION",
    title: "Severe Tropical Storm Devastation Warning - Luzon Strait",
    description: "Meteorological model ensemble indicates intensifying cyclone crossing nominal voyage track. Wave heights exceeding 6.4m with wind gusts > 60 kts.",
    severity: "CRITICAL",
    timestamp: Date.now() - 5400000,
    status: EventStatus.NEW,
    location_name: "Luzon Strait (21.32°N, 121.15°E)",
    lat: 21.32,
    lng: 121.15,
    evidence: [
      {
        id: "ev-wx-001",
        source: "NOAA GFS / JTWC Severe Weather Warning",
        locator: "https://jtwc.met.navy.mil/warnings/wp2226.txt",
        received_time: Date.now() - 4800000,
        text: "Tropical Storm Warning: Sustained winds 55-65 kts, significant wave height 6.2m - 7.1m across Luzon Strait corridor between 20°N-23°N.",
        freshness: FreshnessStatus.FRESH,
        version: "v1.3"
      },
      {
        id: "ev-hyd-002",
        source: "UK Hydrographic Office (UKHO) NavArea XI Navtex",
        locator: "navtex://xi/0482-2026",
        received_time: Date.now() - 3600000,
        text: "Navigation Hazard Notice: Shallow water shoals near Balintang Channel. Minimum charted depth 18.2m; heavy swell induced squat warning.",
        freshness: FreshnessStatus.FRESH,
        version: "v2.0"
      },
      {
        id: "ev-telemetry-003",
        source: "Onboard Inmarsat-C Voyage Data Recorder (VDR)",
        locator: "vdr://v-alpha/stream/telemetry/pos",
        received_time: Date.now() - 900000,
        text: "Current vessel position 21°19'N, 121°09'E. Heading 234°, Speed Over Ground 17.4 kts, Pitch 3.8°, Roll amplitude 11.2°.",
        freshness: FreshnessStatus.FRESH,
        version: "v1.0"
      }
    ]
  },
  {
    id: "evt-singapore-berth",
    idempotency_key: "idemp-sgsin-berth-20260828-09",
    vessel_id: "V-PACIFIC",
    vessel_name: "MV Pacific Voyager",
    event_type: "PORT_BERTH_CONGESTION",
    title: "Terminal Berth T2 Maintenance & Queue Congestion",
    description: "PSA Singapore notified berth availability delayed by +14 hours due to emergency quay crane hydraulic repair and incoming bunkering queue.",
    severity: "HIGH",
    timestamp: Date.now() - 11000000,
    status: EventStatus.RECONCILED,
    location_name: "Singapore Jurong Anchorage (1.25°N, 103.88°E)",
    lat: 1.25,
    lng: 103.88,
    evidence: [
      {
        id: "ev-psa-004",
        source: "PSA Singapore Port Authority API",
        locator: "api://psa.sg/v1/berth/jurong/t2",
        received_time: Date.now() - 10800000,
        text: "Berth Window Update: Scheduled discharge slot postponed from 08:30 UTC to 22:30 UTC (+14h delay).",
        freshness: FreshnessStatus.STALE,
        version: "v1.1"
      },
      {
        id: "ev-bunker-005",
        source: "Global Marine Bunker Schedule (BIMCO)",
        locator: "bimco://bunkers/sg/v-pacific",
        received_time: Date.now() - 7200000,
        text: "Bunkering barge 'Maritime Supply 8' reallocated to Western Anchorage slot at 18:00 UTC.",
        freshness: FreshnessStatus.FRESH,
        version: "v2.0"
      }
    ]
  },
  {
    id: "evt-engine-derating",
    idempotency_key: "idemp-eng-derate-v-horizon-01",
    vessel_id: "V-HORIZON",
    vessel_name: "MV Northern Horizon",
    event_type: "ENGINE_DERATING_ALARM",
    title: "Main Engine Exhaust Gas Temp Exceedance (Cylinder #4)",
    description: "Chief Engineer derated MAN B&W 6S70ME main engine to 65% MCR to prevent turbocharger surging. Maximum safe speed restricted to 11.5 knots.",
    severity: "MEDIUM",
    timestamp: Date.now() - 18000000,
    status: EventStatus.NEW,
    location_name: "Indian Ocean (14.2°S, 62.4°E)",
    lat: -14.2,
    lng: 62.4,
    evidence: [
      {
        id: "ev-eng-006",
        source: "Chief Engineer Official Log & Alarm Teletype",
        locator: "vdr://v-horizon/engine/alarm/cyl4-exh",
        received_time: Date.now() - 17500000,
        text: "Cylinder #4 exhaust valve thermocouple peaked at 485°C. Load curtailed to 65% MCR. Fuel pump timing inspected.",
        freshness: FreshnessStatus.FRESH,
        version: "v1.0"
      }
    ]
  }
];

export const INITIAL_CONSTRAINTS: Record<string, Constraint[]> = {
  "evt-typhoon-luzon": [
    {
      name: "VESSEL_DRAFT_M",
      value: 11.8,
      unit: "meters",
      evidence_ids: ["ev-telemetry-003", "ev-hyd-002"],
      status: "accepted",
      reviewer: Role.MASTER,
      description: "Under-keel dynamic draft in shallow channels (Max allowable: 12.5m)"
    },
    {
      name: "MAX_WAVE_HEIGHT_M",
      value: 4.5,
      unit: "meters",
      evidence_ids: ["ev-wx-001"],
      status: "accepted",
      reviewer: Role.SAFETY_OBS,
      description: "Maximum allowable significant wave height for container lashing stress (Max: 6.0m)"
    },
    {
      name: "BUNKER_SAFETY_MARGIN_PCT",
      value: 26.5,
      unit: "%",
      evidence_ids: ["ev-telemetry-003"],
      status: "accepted",
      reviewer: Role.FLEET_OPS,
      description: "Minimum reserve bunker fuel on arrival (Mandatory min: 15.0%)"
    },
    {
      name: "SOLAS_PASSAGE_PLAN_CLEARANCE",
      value: "COMPLIANT",
      evidence_ids: ["ev-hyd-002"],
      status: "accepted",
      reviewer: Role.MASTER,
      description: "SOLAS V/34 appraisal and UKC safety validation"
    }
  ],
  "evt-singapore-berth": [
    {
      name: "VESSEL_DRAFT_M",
      value: 12.4,
      unit: "meters",
      evidence_ids: ["ev-psa-004"],
      status: "accepted",
      reviewer: Role.FLEET_OPS,
      description: "Jurong Channel approach depth margin"
    },
    {
      name: "BUNKER_SAFETY_MARGIN_PCT",
      value: 18.0,
      unit: "%",
      evidence_ids: ["ev-bunker-005"],
      status: "accepted",
      reviewer: Role.FLEET_OPS,
      description: "Remaining bunker buffer prior to Singapore bunkering"
    }
  ],
  "evt-engine-derating": [
    {
      name: "MAX_ENGINE_LOAD_MCR_PCT",
      value: 65.0,
      unit: "%",
      evidence_ids: ["ev-eng-006"],
      status: "accepted",
      reviewer: Role.BRIDGE_TEAM,
      description: "Main Engine MCR limit to prevent thermal breakdown"
    },
    {
      name: "VESSEL_DRAFT_M",
      value: 10.5,
      unit: "meters",
      evidence_ids: ["ev-eng-006"],
      status: "accepted",
      reviewer: Role.MASTER,
      description: "Current Capesize bulk draft"
    }
  ]
};

export const INITIAL_RECOVERY_OPTIONS: Record<string, RecoveryOption[]> = {
  "evt-typhoon-luzon": [
    {
      id: "opt-rec-luzon-01",
      disruption_id: "evt-typhoon-luzon",
      title: "Plan A: Northern Diversion via Miyako Strait (Nav-Impacting)",
      description: "Execute 72 NM northward deviation through Miyako Strait. Bypasses core cyclone radius (>40 kt wind contour). Sea states restricted to ≤ 3.8m significant wave height.",
      is_navigation_impacting: true,
      generated_by_ai: true,
      evidence_refs: ["ev-wx-001", "ev-hyd-002", "ev-telemetry-003"],
      constraints_validated: true,
      rationale: "Highest safety score. Eliminates parametric roll risk for deck container stacks. Fully satisfies SOLAS Chapter V Rule 34 navigation guidelines.",
      metrics: {
        delay_hours: 5.2,
        fuel_delta_mt: 34.0,
        cost_delta_usd: 21500,
        safety_index: 98
      }
    },
    {
      id: "opt-rec-luzon-02",
      disruption_id: "evt-typhoon-luzon",
      title: "Plan B: Speed Reduction to 11.5 kts on Current Track (Non-Nav Impacting)",
      description: "Maintain charted waypoint track but reduce RPM from 74 to 52 (Speed 11.5 kts). Allows storm eye to clear Luzon corridor before vessel entry.",
      is_navigation_impacting: false,
      generated_by_ai: true,
      evidence_refs: ["ev-wx-001", "ev-telemetry-003"],
      constraints_validated: true,
      rationale: "Zero course deviation. Lower fuel consumption. Delayed entry allows storm front to traverse west into South China Sea.",
      metrics: {
        delay_hours: 8.0,
        fuel_delta_mt: -18.5,
        cost_delta_usd: -8200,
        safety_index: 87
      }
    }
  ],
  "evt-singapore-berth": [
    {
      id: "opt-rec-sg-01",
      disruption_id: "evt-singapore-berth",
      title: "Plan A: Virtual Arrival Slow Steaming to 9.2 kts (Commercial/Ops)",
      description: "Implement Virtual Arrival protocol with PSA Singapore. Decelerate from 13.8 kts to 9.2 kts in Malacca Strait to match rescheduled 22:30 UTC berth window exactly.",
      is_navigation_impacting: false,
      generated_by_ai: true,
      evidence_refs: ["ev-psa-004", "ev-bunker-005"],
      constraints_validated: true,
      rationale: "Saves 28.4 MT VLSFO fuel by eliminating 14 hours of idle anchorage waiting time. Reduced carbon footprint by 88 MT CO2.",
      metrics: {
        delay_hours: 0,
        fuel_delta_mt: -28.4,
        cost_delta_usd: -17600,
        safety_index: 99
      }
    }
  ]
};
