import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOCK_SENSORS } from "@/lib/mock-data/sensors";
import { MOCK_RISKS } from "@/lib/mock-data/risks";
import { REGION_LABELS } from "@/lib/types";
import type { Region } from "@/lib/types";

const FALLBACK_INSIGHTS = {
  overview:
    "Infrastructure monitoring is active across Sub-Saharan Africa, South Asia, and Southeast Asia. Current sensor coverage provides continuous visibility into water quality and soil conditions, with the majority of stations reporting online.",
  urgent_region:
    "Sub-Saharan Africa — highest concentration of critical-level alerts and lower sensor uptime compared to other regions",
  patterns:
    "Water contamination and soil degradation risks are elevated across all three regions, with aging infrastructure contributing to supply disruption concerns.",
  focus_areas: [
    "Prioritize maintenance of offline sensors in Sub-Saharan Africa to restore monitoring coverage",
    "Investigate rising contamination alerts in South Asia watersheds",
    "Expand soil moisture monitoring in Southeast Asia ahead of monsoon season",
  ],
};

function extractJson(raw: string): string {
  let text = raw.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return text;
}

const SYSTEM_PROMPT = `You are a water and soil infrastructure analyst writing for non-technical decision-makers.
Given aggregated dashboard statistics across multiple monitoring regions, produce a holistic summary.

Rules:
- Use simple, everyday language. Avoid jargon.
- Summarize the overall state of water/soil infrastructure across all regions.
- Highlight the most urgent region and explain why it needs attention.
- Note any cross-regional patterns you observe.
- Give 2-3 actionable focus areas.

You MUST respond with valid JSON only, no markdown fences, with these keys:
{
  "overview": "2-4 sentence holistic summary of infrastructure state across all regions",
  "urgent_region": "Name of the most urgent region and a brief explanation why",
  "patterns": "1-2 sentences about cross-regional patterns or trends",
  "focus_areas": ["actionable focus area 1", "actionable focus area 2", "actionable focus area 3"]
}`;

function aggregateDashboardData() {
  const regions: Region[] = [
    "sub-saharan-africa",
    "south-asia",
    "southeast-asia",
  ];

  const regionStats = regions.map((region) => {
    const sensors = MOCK_SENSORS.filter((s) => s.region === region);
    const risks = MOCK_RISKS.filter((r) => r.region === region);
    const online = sensors.filter((s) => s.status === "online").length;
    const critical = risks.filter((r) => r.level === "critical").length;
    const high = risks.filter((r) => r.level === "high").length;

    const categoryCounts: Record<string, number> = {};
    for (const r of risks) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }

    return {
      region: REGION_LABELS[region],
      sensor_count: sensors.length,
      online_percentage: sensors.length
        ? Math.round((online / sensors.length) * 100)
        : 0,
      avg_risk_score: risks.length
        ? Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length)
        : 0,
      critical_alerts: critical,
      high_alerts: high,
      top_risk_categories: Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, count]) => ({ category: cat, count })),
    };
  });

  const totalSensors = MOCK_SENSORS.length;
  const totalCritical = MOCK_RISKS.filter((r) => r.level === "critical").length;
  const totalHigh = MOCK_RISKS.filter((r) => r.level === "high").length;

  return {
    total_sensors: totalSensors,
    total_critical_alerts: totalCritical,
    total_high_alerts: totalHigh,
    regions: regionStats,
  };
}

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, returning fallback insights");
      return NextResponse.json({
        ...FALLBACK_INSIGHTS,
        generated_at: new Date().toISOString(),
        source: "fallback" as const,
      });
    }

    const dashboardData = aggregateDashboardData();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `Analyze this aggregated dashboard data and produce your JSON summary:\n\n${JSON.stringify(dashboardData, null, 2)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const text = extractJson(raw);

    let insights;
    try {
      insights = JSON.parse(text);
    } catch (parseError) {
      console.warn("Gemini JSON parse failed. Raw text:", raw);
      return NextResponse.json({
        ...FALLBACK_INSIGHTS,
        generated_at: new Date().toISOString(),
        source: "fallback" as const,
      });
    }

    return NextResponse.json({
      ...insights,
      generated_at: new Date().toISOString(),
      source: "ai" as const,
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json({
      ...FALLBACK_INSIGHTS,
      generated_at: new Date().toISOString(),
      source: "fallback" as const,
    });
  }
}
