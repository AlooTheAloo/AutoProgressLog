export const otherRoutes = [
  { path: "/about", component: () => import("../About/About.vue") },
  { path: "/update-app", component: () => import("../Update/Update.vue") },
] as const;
