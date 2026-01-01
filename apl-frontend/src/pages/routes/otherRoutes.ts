export const otherRoutes = [
  { path: "/about", component: () => import("../About/About.vue") },
  { path: "/update-app", component: () => import("../Update/Update.vue") },
  { path: "/update/2_0_0", component: () => import("../Update/2_0_0.vue") },
] as const;
