import type { Sprint } from "../state/types";

export const SPRINT_META: Record<Sprint, { label: string; emoji: string }> = {
  soberin_revenue: { label: "Soberin Revenue", emoji: "\uD83D\uDD25" },
  outreach: { label: "Outreach", emoji: "\uD83D\uDCDE" },
  build_mode: { label: "Build Mode", emoji: "\uD83D\uDEE0\uFE0F" },
  admin: { label: "Admin", emoji: "\uD83D\uDCCB" },
};

export const ALL_SPRINTS: Sprint[] = [
  "soberin_revenue",
  "outreach",
  "build_mode",
  "admin",
];
