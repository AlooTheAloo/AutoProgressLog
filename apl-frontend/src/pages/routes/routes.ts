import { RouteRecordRaw } from "vue-router";
import PageSelector from "./../PageSelector.vue";
import { setupRoutes } from "./setupRoutes";
import { appRoutes } from "./appRoutes";

const routes:RouteRecordRaw[] = [
    { path: '/', component: PageSelector },
    ...setupRoutes,
    ...appRoutes
  ]

export default routes;