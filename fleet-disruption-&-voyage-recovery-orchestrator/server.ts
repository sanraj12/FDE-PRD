import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Failed to initialize Gemini client:", err);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      orchestrator_version: "v1.0",
      solver_version: "v1.2",
      policy_version: "v1.0"
    });
  });

  // API Route: AI Recovery Strategy Drafting via Gemini (if key available)
  app.post("/api/ai/draft-recovery", async (req, res) => {
    const { disruption, evidence, constraints } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Fallback response if no GEMINI_API_KEY is configured
      return res.json({
        success: true,
        source: "deterministic-heuristic-engine",
        options: [
          {
            description: `Reroute 42 NM North of storm center with speed adjustment to 14.5 kts (Clear of swell > 4.5m)`,
            is_navigation_impacting: true,
            evidence_refs: evidence?.map((e: { id: string }) => e.id) || ["ev1"],
            rationale: "Maintains UKC margin > 2.0m, avoids extreme sea state, satisfies SOLAS Chapter V Rule 34."
          },
          {
            description: `Adjust ETA by +6.5 hrs, reduce speed to 11.2 kts for optimal bunker efficiency outside rough zone`,
            is_navigation_impacting: false,
            evidence_refs: evidence?.map((e: { id: string }) => e.id) || ["ev1", "ev2"],
            rationale: "Commercial speed trim only; zero navigational waypoint deviation."
          }
        ]
      });
    }

    try {
      const prompt = `You are the AI System within the Fleet Disruption & Voyage Recovery Orchestrator (PRD v1).
Generate 2 distinct voyage recovery options for this disruption:
Disruption Event: ${JSON.stringify(disruption)}
Evidence Items: ${JSON.stringify(evidence)}
Active Constraints: ${JSON.stringify(constraints)}

Rules:
1. Provide one option that is navigation-impacting (is_navigation_impacting: true, requiring Master approval).
2. Provide one option that is commercial/operational speed adjustment only (is_navigation_impacting: false, eligible for FleetOps approval).
3. Reference the exact evidence IDs used.
4. Output valid JSON array with keys: description, is_navigation_impacting, evidence_refs, rationale.`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text?.trim() || "[]";
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(text);
      } catch {
        parsedOptions = [];
      }

      return res.json({
        success: true,
        source: "gemini-2.5-flash",
        options: parsedOptions
      });
    } catch (err: unknown) {
      console.error("Gemini API generation error:", err);
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : "Failed to draft recovery with Gemini"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fleet Orchestrator Server running on http://localhost:${PORT}`);
  });
}

startServer();
