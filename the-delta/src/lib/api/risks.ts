import type { RiskAssessment, RiskFilter } from "@/lib/types";
import { MOCK_RISKS } from "@/lib/mock-data/risks";
import { mockFetch } from "./client";

export async function fetchRisks(filter?: RiskFilter): Promise<RiskAssessment[]> {
  let risks = [...MOCK_RISKS];

  if (filter?.level) {
    risks = risks.filter((r) => r.level === filter.level);
  }
  if (filter?.category) {
    risks = risks.filter((r) => r.category === filter.category);
  }
  if (filter?.region) {
    risks = risks.filter((r) => r.region === filter.region);
  }

  const sortBy = filter?.sortBy ?? "score";
  const sortOrder = filter?.sortOrder ?? "desc";

  risks.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "score") cmp = a.score - b.score;
    else if (sortBy === "assessedAt")
      cmp =
        new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime();
    else if (sortBy === "level") {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      cmp = order[a.level] - order[b.level];
    }
    return sortOrder === "desc" ? -cmp : cmp;
  });

  return mockFetch(risks);
}

export async function fetchRisk(id: string): Promise<RiskAssessment | null> {
  const risk = MOCK_RISKS.find((r) => r.id === id) ?? null;
  return mockFetch(risk);
}
