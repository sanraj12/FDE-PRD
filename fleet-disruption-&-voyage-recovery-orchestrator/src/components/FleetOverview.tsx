import React from "react";
import { Vessel, DisruptionEvent } from "../types/orchestrator";
import {
  Ship,
  Navigation,
  Gauge,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Anchor,
  Clock,
  ArrowRight
} from "lucide-react";

interface FleetOverviewProps {
  vessels: Vessel[];
  disruptions: DisruptionEvent[];
  selectedDisruptionId: string | null;
  onSelectDisruption: (disruptionId: string) => void;
  onSelectVessel: (vesselId: string) => void;
  selectedVesselId: string | null;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  vessels,
  disruptions,
  selectedDisruptionId,
  onSelectDisruption,
  onSelectVessel,
  selectedVesselId
}) => {
  return (
    <div id="fleet-overview-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Active Maritime Fleet & Situational Status
            </h2>
            <p className="text-xs text-slate-400">
              Live telemetry, under-keel draft margins, and active voyage disruptions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{disruptions.filter((d) => d.status === "new").length} Active Alerts</span>
          </span>
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{vessels.length} Monitored Vessels</span>
          </span>
        </div>
      </div>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {vessels.map((vessel) => {
          const activeDisruption = disruptions.find(
            (d) => d.vessel_id === vessel.id || d.id === vessel.active_disruption_id
          );
          const isSelected = selectedVesselId === vessel.id;
          const isDisruptionSelected = activeDisruption && selectedDisruptionId === activeDisruption.id;

          const isDraftNearLimit = vessel.current_draft_m > 12.0;

          return (
            <div
              key={vessel.id}
              id={`vessel-card-${vessel.id.toLowerCase()}`}
              onClick={() => {
                onSelectVessel(vessel.id);
                if (activeDisruption) {
                  onSelectDisruption(activeDisruption.id);
                }
              }}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                isSelected || isDisruptionSelected
                  ? "bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/40"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              {/* Top Row: Name, Flag, IMO */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{vessel.flag}</span>
                    <h3 className="text-sm font-semibold text-slate-100">{vessel.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {vessel.imo} • Callsign: {vessel.callsign}
                  </p>
                </div>

                {activeDisruption ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center space-x-1 ${
                      activeDisruption.severity === "CRITICAL"
                        ? "bg-rose-950 text-rose-300 border border-rose-800 animate-pulse"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{activeDisruption.severity}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>NORMAL</span>
                  </span>
                )}
              </div>

              {/* Voyage Route */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="truncate max-w-[140px]">{vessel.origin_port.split(",")[0]}</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-medium text-white truncate max-w-[140px]">
                    {vessel.destination_port.split(",")[0]}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>ETA: {vessel.eta}</span>
                </div>
              </div>

              {/* Metrics: Draft, Speed, Bunker */}
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800/80 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Draft</span>
                  <span
                    className={`font-semibold ${
                      isDraftNearLimit ? "text-amber-400" : "text-slate-200"
                    }`}
                  >
                    {vessel.current_draft_m}m
                    <span className="text-[9px] text-slate-500 font-normal"> / {vessel.max_draft_m}m</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Speed</span>
                  <span className="font-semibold text-slate-200">{vessel.speed_knots} kts</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Bunker</span>
                  <span className="font-semibold text-slate-200">{vessel.bunker_remaining_pct}%</span>
                </div>
              </div>

              {/* Active Disruption Link Tag */}
              {activeDisruption && (
                <div className="mt-2.5 text-[11px] text-blue-400 flex items-center justify-between font-medium">
                  <span className="truncate pr-2">{activeDisruption.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
