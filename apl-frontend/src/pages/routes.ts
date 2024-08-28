import { RouteRecordRaw } from "vue-router";
import PageSelector from "./PageSelector.vue";
import SetupClientServerSelection from "./Setup/Setup-client-server-selection.vue";
import SetupIndex from "./Setup/SetupIndex.vue";
import TogglHome from "./Setup/Toggl/Toggl-home.vue";
import TogglConnect from "./Setup/Toggl/Toggl-connect.vue";
import TogglManualConnect from "./Setup/Toggl/Toggl-manual-connect.vue";
import TogglSuccess from "./Setup/Toggl/Toggl-success.vue";
import TogglFailure from "./Setup/Toggl/Toggl-failure.vue";

const routes:RouteRecordRaw[] = [
    { path: '/', component: PageSelector },
    { path: '/setup/index', component: SetupIndex },
    { path: '/setup/client-server-selection', component: SetupClientServerSelection  },
    { path: '/setup/toggl-home', component: TogglHome },
    { path: '/setup/toggl-manual-connect', component: TogglManualConnect },
    { path: '/setup/toggl-connect', component: TogglConnect },
    { path: '/setup/toggl-success', component: TogglSuccess },
    { path: '/setup/toggl-failure', component: TogglFailure },
  ]

export default routes;