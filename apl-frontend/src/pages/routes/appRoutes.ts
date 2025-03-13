export const appRoutes = [
  { path: "/app/dashboard", component: () => import("../App/Dashboard.vue") },
  { path: "/app/reports", component: () => import("../App/Reports.vue") },
  { path: "/app/settings", component: () => import("../App/Settings.vue") },
] as const;

export type appPath = (typeof appRoutes)[number]["path"];
