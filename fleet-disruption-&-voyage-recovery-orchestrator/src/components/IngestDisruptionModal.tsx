import React, { useState } from "react";
import { Vessel, EvidenceItem, FreshnessStatus } from "../types/orchestrator";
import {
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Layers,
  Copy,
  Radio,
  Sparkles
} from "lucide-react";

interface IngestDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessels: Vessel[];
  onIngest: (
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
  ) => { duplicate: boolean };
}

export const IngestDisruptionModal: React.FC<IngestDisruptionModalProps> = ({
  isOpen,
  onClose,
  vessels,
  onIngest
}) => {
  const [selectedVesselId, setSelectedVesselId] = useState(vessels[0]?.id || "V-ALPHA");
  const [eventType, setEventType] = useState("WEATHER_DEVIATION");
  const [title, setTitle] = useState("Typhoon Tracking Deviation - East Sea");
  const [description, setDescription] = useState(
    "High swell (>5.5m) and squalls reported along nominal corridor. Pre-emptive voyage review initiated."
  );
  const [severity, setSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [locationName, setLocationName] = useState("East China Sea (26.5°N, 124.0°E)");
  const [lat, setLat] = useState(26.5);
  const [lng, setLng] = useState(124.0);
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => `idemp-event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  );

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: "ev-ingest-01",
      source: "NOAA GFS / Maritime Weather Bulletin",
      locator: "noaa://bulletin/marine-wx-265",
      received_time: Date.now(),
      text: "Tropical depression advisory: Wave heights 5.0-6.2m expected along passage within next 12-24h.",
      freshness: FreshnessStatus.FRESH,
      version: "v1.0"
    }
  ]);

  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddEvidence = () => {
    const newEv: EvidenceItem = {
      id: `ev-ingest-${Date.now().toString(36)}`,
      source: "Port / Hydrographic Agency Telemetry",
      locator: "telemetry://channel-nav-notice",
      received_time: Date.now(),
      text: "Operational notice: Anchorage draft restriction or wave warning active.",
      freshness: FreshnessStatus.FRESH,
      version: "v1.0"
    };
    setEvidenceList([...evidenceList, newEv]);
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vessel = vessels.find((v) => v.id === selectedVesselId);
    const result = onIngest(idempotencyKey, selectedVesselId, eventType, evidenceList, {
      title,
      description,
      vessel_name: vessel?.name || selectedVesselId,
      severity,
      location_name: locationName,
      lat,
      lng
    });

    if (result.duplicate) {
      setDuplicateMessage(
        `[WF-01] Idempotency Key '${idempotencyKey}' was already ingested. Duplicate event safely dropped and logged to Immutable Audit Trail.`
      );
    } else {
      onClose();
    }
  };

  const handleSimulateDuplicate = () => {
    // Keep same idempotency key and attempt re-ingest
    handleSubmit({ preventDefault: () => {} } as any);
  };

  return (
    <div id="ingest-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                WF-01: Ingest Disruption Event
              </h2>
              <p className="text-xs text-slate-400">
                Durable capture with idempotency deduplication and provenance tracking.
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

        {/* Duplicate Warning Banner if fired */}
        {duplicateMessage && (
          <div className="px-6 py-3 bg-amber-950/70 border-b border-amber-800 text-amber-200 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Idempotency Intercepted:</span> {duplicateMessage}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Vessel</label>
              <select
                value={selectedVesselId}
                onChange={(e) => setSelectedVesselId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Disruption Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="WEATHER_DEVIATION">WEATHER_DEVIATION (Storm / Swell)</option>
                <option value="PORT_BERTH_CONGESTION">PORT_BERTH_CONGESTION (Berth Delay)</option>
                <option value="ENGINE_DERATING_ALARM">ENGINE_DERATING_ALARM (Machinery MCR Limit)</option>
                <option value="CANAL_TRANSIT_DELAY">CANAL_TRANSIT_DELAY (Suez/Panama Congestion)</option>
                <option value="ECA_SULPHUR_CAP">ECA_SULPHUR_CAP (Emission Zone Switch)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Alert Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="CRITICAL">CRITICAL (Direct Safety Hazard)</option>
                <option value="HIGH">HIGH (ETA & Route Impact)</option>
                <option value="MEDIUM">MEDIUM (Operational Advisory)</option>
                <option value="LOW">LOW (Informational Notice)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Detailed Operational Synopsis</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Location Descriptor</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Latitude (°N)</label>
              <input
                type="number"
                step="0.01"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Longitude (°E)</label>
              <input
                type="number"
                step="0.01"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Idempotency Key Section */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-medium">
                FR-014 Idempotency Key (Deduplication Token)
              </label>
              <button
                type="button"
                onClick={() =>
                  setIdempotencyKey(
                    `idemp-event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
                  )
                }
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                Regenerate Key
              </button>
            </div>
            <input
              type="text"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">
              Deterministic deduplication key prevents duplicate operational action execution during network retransmissions.
            </p>
          </div>

          {/* Attached Evidence Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-medium">
                FR-002 Provenance Evidence Items ({evidenceList.length})
              </label>
              <button
                type="button"
                onClick={handleAddEvidence}
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Evidence Item</span>
              </button>
            </div>

            {evidenceList.map((ev, idx) => (
              <div
                key={ev.id}
                className="bg-slate-950 border border-slate-800 p-3 rounded-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[11px]">#{idx + 1} ID: {ev.id}</span>
                  {evidenceList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(idx)}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Evidence Source (e.g. NOAA GFS)"
                    value={ev.source}
                    onChange={(e) => {
                      const updated = [...evidenceList];
                      updated[idx].source = e.target.value;
                      setEvidenceList(updated);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Locator / URI"
                    value={ev.locator}
                    onChange={(e) => {
                      const updated = [...evidenceList];
                      updated[idx].locator = e.target.value;
                      setEvidenceList(updated);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Evidence text / telemetry excerpt..."
                  value={ev.text}
                  onChange={(e) => {
                    const updated = [...evidenceList];
                    updated[idx].text = e.target.value;
                    setEvidenceList(updated);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
            ))}
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              id="btn-simulate-duplicate"
              onClick={handleSimulateDuplicate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700 text-xs font-medium cursor-pointer"
              title="Test FR-014: Attempt re-ingest with identical idempotency key to test deduplication intercept"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Simulate Duplicate Ingest (Test Idempotency)</span>
            </button>

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
                id="btn-confirm-ingest"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                Ingest Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
