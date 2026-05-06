import type { SprintDef } from "../state/types";

export const DEFAULT_SPRINTS: SprintDef[] = [
  { id: "soberin_revenue", label: "Soberin Revenue", emoji: "\uD83D\uDD25", description: "Vibe coding, software services, immediate $", status: "active", archivedAt: null },
  { id: "chief_challengers", label: "Chief Challengers", emoji: "\uD83D\uDE80", description: "Everything to build the product", status: "active", archivedAt: null },
  { id: "personal_brand", label: "Personal Brand", emoji: "\uD83C\uDFA4", description: "Content creation, set up meetings, hustle", status: "active", archivedAt: null },
  { id: "elite_admit", label: "Elite Admit", emoji: "\uD83C\uDF93", description: "Complete Gut's application", status: "active", archivedAt: null },
  { id: "admin", label: "Admin", emoji: "\uD83D\uDCCB", description: "Emails, follow-ups, paperwork, the avoided stuff", status: "active", archivedAt: null },
];
