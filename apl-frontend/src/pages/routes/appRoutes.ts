export const appRoutes = [
    { path: "/app/dashboard", component: () => import("../App/Dashboard.vue") },
] as const;

export type appPath = typeof appRoutes[number]['path'];
