import { RouteRecordRaw } from "vue-router";
import PageSelector from "./../PageSelector.vue";
import { setupRoutes } from "./setupRoutes";
import { appRoutes } from "./appRoutes";
import { otherRoutes } from "./otherRoutes";

const routes: RouteRecordRaw[] = [
  { path: "/", component: PageSelector },
  ...setupRoutes,
  ...appRoutes,
  ...otherRoutes,
];

export default routes;
