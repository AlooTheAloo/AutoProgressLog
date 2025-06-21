export const surveyRoutes = [
  {
    path: "/survey/index",
    component: () => import("../Survey/SurveyIndex.vue"),
  },
  {
    path: "/survey/refold",
    component: () => import("../Survey/SurveyRefold.vue"),
  },
  {
    path: "/survey/learning",
    component: () => import("../Survey/SurveyLearning.vue"),
  },
  { path: "/survey/apps", component: () => import("../Survey/SurveyApps.vue") },
];

export const setupRoutes = [
  {
    path: "/setup/index",
    component: () => import("../Setup/Other/SetupIndex.vue"),
  },
  {
    path: "/setup/auth",
    component: () => import("../Setup/Auth/Setup-Auth.vue"),
  },
  {
    path: "/setup/client-server-selection",
    component: () => import("../Setup/Other/Setup-client-server-selection.vue"),
  },
  {
    path: "/setup/server-setup",
    component: () => import("../Setup/Server/ServerSetup.vue"),
  },
  {
    path: "/setup/toggl-manual-connect",
    component: () => import("../Setup/Toggl/Toggl-manual-connect.vue"),
  },
  {
    path: "/setup/toggl-success",
    component: () => import("../Setup/Toggl/Toggl-success.vue"),
  },
  {
    path: "/setup/toggl-failure",
    component: () => import("../Setup/Toggl/Toggl-failure.vue"),
  },
  {
    path: "/setup/anki-home",
    component: () => import("../Setup/Anki/AnkiHome.vue"),
  },
  {
    path: "/setup/anki-connect",
    component: () => import("../Setup/Anki/AnkiConnect.vue"),
  },
  {
    path: "/setup/anki-success",
    component: () => import("../Setup/Anki/AnkiSuccess.vue"),
  },
  {
    path: "/setup/anki-failure",
    component: () => import("../Setup/Anki/AnkiFailure.vue"),
  },
  {
    path: "/setup/anki-decks",
    component: () => import("../Setup/Anki/AnkiDeckSelect.vue"),
  },
  {
    path: "/setup/anki-reading",
    component: () => import("../Setup/Anki/AnkiReading.vue"),
  },
  {
    path: "/setup/pick-filename",
    component: () => import("../Setup/Other/Pick-Filename.vue"),
  },
  {
    path: "/setup/pick-survey",
    component: () => import("../Setup/Other/SurveySelect.vue"),
  },
  {
    path: "/setup/complete",
    component: () => import("../Setup/Other/SetupComplete.vue"),
  },
  ...surveyRoutes,
];
