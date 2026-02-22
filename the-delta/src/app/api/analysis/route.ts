import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are a water and soil quality analyst writing for non-technical community members.
Given structured sensor analysis data, produce a clear, plain-English summary.

Rules:
- Use simple, everyday language. Avoid jargon.
- Explain what the trend means for water or soil quality in practical terms.
- Describe anomalies as "unusual spikes" or "unexpected changes" — not statistical terms.
- Give exactly one actionable recommendation.
- Assign a risk_level: "low", "moderate", "high", or "critical".

You MUST respond with valid JSON only, no markdown fences, with these keys:
{
  "summary": "2-3 sentence overview of what the data shows",
  "trend_explanation": "What the trend means in plain terms",
  "anomaly_note": "Brief note about any unusual readings, or 'No unusual readings detected.'",
  "recommendation": "One actionable sentence",
  "risk_level": "low | moderate | high | critical"
}`;

interface AnalysisRequest {
  sensorId: string;
  metricKey: string;
  history?: { ts: number; value: number }[];
}

// Lightweight Kalman filter matching the Python implementation
function kalmanFilter(values: number[]) {
  if (values.length === 0) return { filtered: [], anomalies: [] as number[] };

  const processNoise = 1e-2;
  const measurementNoise = 4e-1;
  const anomalySigma = 3.0;

  let x = values[0];
  let p = 1.0;
  const filtered: number[] = [];
  const anomalies: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const z = values[i];
    const pPred = p + processNoise;
    const innovation = z - x;
    const innovationVar = pPred + measurementNoise;
    const innovationStd = Math.sqrt(Math.max(innovationVar, 1e-9));

    const isAnomaly = Math.abs(innovation) > anomalySigma * innovationStd;
    if (isAnomaly) anomalies.push(i);

    const rEff = measurementNoise * (isAnomaly ? 6.0 : 1.0);
    const k = pPred / (pPred + rEff);
    x = x + k * innovation;
    p = (1 - k) * pPred;
    filtered.push(x);
  }

  return { filtered, anomalies };
}

function evaluateTrend(
  values: number[],
  filtered: number[],
  anomalyCount: number
) {
  const n = Math.min(values.length, filtered.length);
  if (n < 3)
    return { direction: "stable", slope: 0, confidence: 0, anomalyCount, pointsUsed: n };

  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = filtered.slice(0, n);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  const num = xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0);
  const den = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;

  const ySpan = Math.max(...ys) - Math.min(...ys);
  const slopeStrength = Math.min(1, Math.abs(slope) / Math.max(0.1, ySpan / Math.max(1, n - 1)));
  const anomalyPenalty = Math.min(0.6, anomalyCount / Math.max(1, n));
  const confidence = Math.max(0, Math.min(1, slopeStrength * (1 - anomalyPenalty)));

  let direction = "stable";
  if (Math.abs(slope) >= 0.01) direction = slope > 0 ? "up" : "down";

  return { direction, slope, confidence, anomalyCount, pointsUsed: n };
}

// Demo data for when no history is provided
function generateDemoHistory(metricKey: string) {
  const baseValues: Record<string, number> = {
    temperature: 30,
    ph: 7.0,
    turbidity: 15,
    dissolvedOxygen: 8,
    flowRate: 120,
    pressure: 2.1,
    soilMoisture: 35,
    soilTemperature: 25,
    soilPh: 6.5,
    electricalConductivity: 1.2,
  };
  const base = baseValues[metricKey] ?? 20;
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: 20 }, (_, i) => ({
    ts: now - (20 - i) * 300,
    value: base + (Math.random() - 0.4) * base * 0.1 + (i === 12 ? base * 0.5 : 0),
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalysisRequest;
    const { sensorId, metricKey, history } = body;

    if (!sensorId || !metricKey) {
      return NextResponse.json(
        { error: "sensorId and metricKey are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use provided history or generate demo data
    const dataPoints = history ?? generateDemoHistory(metricKey);
    const rawValues = dataPoints.map((d) => d.value);

    // Run Kalman filter and trend analysis
    const { filtered, anomalies } = kalmanFilter(rawValues);
    const trend = evaluateTrend(rawValues, filtered, anomalies.length);

    const analysisData = {
      metric: metricKey,
      sensor_id: sensorId,
      trend_direction: trend.direction,
      trend_slope: Math.round(trend.slope * 10000) / 10000,
      trend_confidence: Math.round(trend.confidence * 100) / 100,
      anomalies_detected: trend.anomalyCount,
      total_data_points: trend.pointsUsed,
      raw_value_min: rawValues.length ? Math.round(Math.min(...rawValues) * 100) / 100 : null,
      raw_value_max: rawValues.length ? Math.round(Math.max(...rawValues) * 100) / 100 : null,
      raw_value_latest: rawValues.length ? Math.round(rawValues[rawValues.length - 1] * 100) / 100 : null,
      filtered_value_min: filtered.length ? Math.round(Math.min(...filtered) * 100) / 100 : null,
      filtered_value_max: filtered.length ? Math.round(Math.max(...filtered) * 100) / 100 : null,
      filtered_value_latest: filtered.length ? Math.round(filtered[filtered.length - 1] * 100) / 100 : null,
    };

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = `Analyze this sensor data and produce your JSON summary:\n\n${JSON.stringify(analysisData, null, 2)}`;
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown fences if present
    if (text.startsWith("```")) {
      text = text.includes("\n") ? text.split("\n").slice(1).join("\n") : text.slice(3);
    }
    if (text.endsWith("```")) {
      text = text.slice(0, text.lastIndexOf("```"));
    }
    text = text.trim();

    const aiSummary = JSON.parse(text);

    return NextResponse.json(aiSummary);
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
