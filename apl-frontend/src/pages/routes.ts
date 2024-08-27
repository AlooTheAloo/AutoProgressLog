import { RouteRecordRaw } from "vue-router";
import PageSelector from "./PageSelector.vue";
import SetupClientServerSelection from "./Setup/Setup-client-server-selection.vue";
import SetupIndex from "./Setup/SetupIndex.vue";
import TogglHome from "./Setup/Toggl/Toggl-home.vue";
import TogglConnect from "./Setup/Toggl/Toggl-connect.vue";
import TogglManualConnect from "./Setup/Toggl/Toggl-manual-connect.vue";

const routes:RouteRecordRaw[] = [
    { path: '/', component: PageSelector },
    { path: '/setup/index', component: SetupIndex },
    { path: '/setup/client-server-selection', component: SetupClientServerSelection  },
    { path: '/setup/toggl-home', component: TogglHome },
    { path: '/setup/toggl-manual-connect', component: TogglManualConnect },
    { path: '/setup/toggl-connect', component: TogglConnect },
  ]

export default routes;