import type {
  RiskAssessment,
  RiskCategory,
  RiskLevel,
  ForecastPoint,
  Correlation,
} from "@/lib/types";
import {
  fakeTxSignature,
  fakeHash,
  pickRandom,
  randomInRange,
  randomInt,
  hoursAgo,
} from "./generators";
import { MOCK_SENSORS } from "./sensors";

const CATEGORIES: RiskCategory[] = [
  "contamination",
  "infrastructure-failure",
  "drought",
  "flooding",
  "supply-disruption",
  "soil-degradation",
  "salinity-intrusion",
  "nutrient-depletion",
];

const NARRATIVES: Record<RiskCategory, string[]> = {
  contamination: [
    "Elevated turbidity levels detected alongside declining pH readings suggest potential upstream contamination from agricultural runoff. The AI model identifies a 78% correlation with recent rainfall patterns in the watershed area. Immediate water sampling is recommended at distribution endpoints.\n\nHistorical analysis of similar patterns in the region indicates contamination events typically escalate over 48-72 hours without intervention. The dissolved oxygen levels remain within acceptable range but show a downward trend that warrants monitoring.\n\nRecommended actions include activating backup treatment protocols and issuing precautionary advisories to downstream communities.",
    "Bacterial indicators have exceeded threshold levels at multiple monitoring points within the distribution network. Cross-referencing with maintenance logs reveals potential pipe integrity issues in sections installed before 2015. The AI assessment flags a compounding risk from elevated water temperatures.\n\nThe contamination pattern suggests a point-source rather than diffuse pollution, narrowing the investigation area. Predictive models indicate the affected zone may expand by 15-20% over the next 24 hours based on flow dynamics.",
  ],
  "infrastructure-failure": [
    "Pressure anomalies detected across three connected nodes indicate potential pipe failure in the main transmission line. Acoustic leak detection algorithms estimate a 65% probability of a significant leak within the next 72 hours. The affected section serves approximately 45,000 people.\n\nStructural integrity models, trained on failure data from similar infrastructure, identify age-related corrosion as the primary risk factor. The predicted failure mode is a circumferential crack at a joint connection.\n\nPreventive maintenance should be scheduled within 48 hours. Emergency response teams should pre-position equipment for rapid intervention.",
    "Flow rate sensors report intermittent drops of 30-40% at distribution points, suggesting pump station degradation. The AI model correlates these patterns with electrical supply instability recorded over the past two weeks. Backup power systems show reduced capacity.\n\nThe cascading failure probability for the regional network reaches concerning levels if primary pumping capacity drops below 60%. Population impact assessment estimates 120,000 residents at risk of service disruption.",
  ],
  drought: [
    "Reservoir levels have declined 23% over the past 30 days, significantly exceeding the seasonal average decline of 8%. Climate models project continued below-average rainfall for the next 6-8 weeks. The AI risk model combines satellite-derived soil moisture data with groundwater monitoring to project a critical threshold breach within 45 days.\n\nDemand-side analysis shows consumption patterns inconsistent with current supply trajectories. Without intervention, rationing may become necessary within 3-4 weeks. Historical precedent from 2019 drought conditions suggests early demand management reduces crisis duration by 40%.\n\nRecommendations include implementing tiered water pricing, activating community awareness campaigns, and coordinating with regional water authorities for emergency supply agreements.",
  ],
  flooding: [
    "Upstream water level sensors detect rapid rises consistent with flood event initiation. The AI model integrates real-time gauge data with topographic analysis to project inundation zones. Treatment plant infrastructure in the projected flood path serves 85,000 residents.\n\nHistorical flood pattern analysis suggests peak water levels will be reached within 12-18 hours. Treatment plant elevation provides approximately 1.2 meters of freeboard above projected levels. Precautionary measures should begin immediately.\n\nThe verification system has recorded all sensor readings on-chain to ensure data integrity for post-event analysis and insurance documentation.",
  ],
  "supply-disruption": [
    "Supply chain analysis identifies a convergence of risk factors affecting chemical treatment supplies. Primary supplier transport routes are affected by seasonal road conditions, with delivery reliability dropping to 62% over the past month. Current chemical reserves will sustain treatment operations for approximately 12 days.\n\nAlternative supply routes have been modeled, adding 3-5 days to delivery timelines. The AI system recommends activating secondary supplier agreements and adjusting treatment protocols to extend chemical reserves by 20% without compromising water quality below safety thresholds.\n\nPopulation impact modeling estimates 200,000+ residents affected if treatment capacity falls below minimum standards.",
  ],
  "soil-degradation": [
    "Soil moisture sensors indicate a sustained decline in organic matter content across monitored agricultural zones. Satellite NDVI data corroborates reduced vegetation health over the past 60 days. The fusion model identifies compaction and erosion as primary degradation vectors.\n\nGround-truth sensor readings diverge from satellite estimates by 12-18%, highlighting the value of in-situ monitoring for calibrating remote sensing data. Recommended interventions include cover cropping and reduced tillage practices.",
  ],
  "salinity-intrusion": [
    "Electrical conductivity readings from coastal soil sensors have exceeded 4 dS/m at multiple monitoring points, indicating progressive salinity intrusion. Satellite-derived soil moisture maps show anomalous patterns consistent with saltwater encroachment into freshwater aquifers.\n\nThe fusion model projects salinity levels will reach crop-damaging thresholds within 30 days without intervention. Recommended actions include activating freshwater flushing protocols and adjusting irrigation schedules.",
  ],
  "nutrient-depletion": [
    "Soil pH and conductivity sensors report declining nutrient availability across monitored croplands. The AI model correlates these readings with satellite vegetation indices showing progressive chlorosis patterns. Ground-truth data indicates nitrogen and phosphorus levels have dropped below optimal thresholds.\n\nFused satellite-sensor analysis provides 23% more accurate nutrient mapping than satellite-only estimates. Precision fertilization recommendations have been generated based on the combined dataset.",
  ],
};

function generateForecast(baseScore: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const drift = Math.sin(i / 5) * 10 + randomInRange(-5, 5);
    const predicted = Math.max(0, Math.min(100, baseScore + drift));
    points.push({
      date: date.toISOString().split("T")[0],
      predicted: Math.round(predicted),
      lower: Math.round(Math.max(0, predicted - randomInRange(8, 15))),
      upper: Math.round(Math.min(100, predicted + randomInRange(8, 15))),
    });
  }
  return points;
}

function generateCorrelations(): Correlation[] {
  const factors = [
    "Rainfall",
    "Temperature",
    "Population Density",
    "Infrastructure Age",
    "Maintenance Frequency",
    "Chemical Supply",
    "Groundwater Level",
    "Upstream Activity",
  ];
  return factors
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(4, 6))
    .map((factor) => ({
      factor,
      value: Math.round(randomInRange(-0.9, 0.9) * 100) / 100,
      direction:
        Math.random() > 0.5
          ? ("positive" as const)
          : ("negative" as const),
    }));
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export const MOCK_RISKS: RiskAssessment[] = MOCK_SENSORS.slice(0, 40).map(
  (sensor, i) => {
    const score = Math.round(randomInRange(10, 95));
    const category = pickRandom(CATEGORIES);
    const narrativeOptions = NARRATIVES[category];

    return {
      id: `RISK-${String(i + 1).padStart(4, "0")}`,
      sensorId: sensor.id,
      sensorName: sensor.name,
      region: sensor.region,
      level: scoreToLevel(score),
      score,
      category,
      title: `${category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Risk — ${sensor.name}`,
      narrative: pickRandom(narrativeOptions),
      forecast: generateForecast(score),
      correlations: generateCorrelations(),
      assessedAt: hoursAgo(randomInt(1, 72)),
      txSignature: fakeTxSignature(),
      dataHash: fakeHash(),
    };
  }
);
