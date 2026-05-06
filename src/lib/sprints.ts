import type { Sprint } from "../state/types";

export const SPRINT_META: Record<Sprint, { label: string; emoji: string; description: string }> = {
  soberin_revenue: { label: "Soberin Revenue", emoji: "\uD83D\uDD25", description: "Vibe coding, software services, immediate $" },
  chief_challengers: { label: "Chief Challengers", emoji: "\uD83D\uDE80", description: "Everything to build the product" },
  personal_brand: { label: "Personal Brand", emoji: "\uD83C\uDFA4", description: "Content creation, set up meetings, hustle" },
  elite_admit: { label: "Elite Admit", emoji: "\uD83C\uDF93", description: "Complete Gut's application" },
  admin: { label: "Admin", emoji: "\uD83D\uDCCB", description: "Emails, follow-ups, paperwork, the avoided stuff" },
};

export const ALL_SPRINTS: Sprint[] = [
  "soberin_revenue",
  "chief_challengers",
  "personal_brand",
  "elite_admit",
  "admin",
];
