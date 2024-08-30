import { RouteRecordRaw } from "vue-router";
import PageSelector from "./PageSelector.vue";
import SetupClientServerSelection from "./Setup/Other/Setup-client-server-selection.vue";
import SetupIndex from "./Setup/Other/SetupIndex.vue";
import TogglHome from "./Setup/Toggl/Toggl-home.vue";
import TogglConnect from "./Setup/Toggl/Toggl-connect.vue";
import TogglManualConnect from "./Setup/Toggl/Toggl-manual-connect.vue";
import TogglSuccess from "./Setup/Toggl/Toggl-success.vue";
import TogglFailure from "./Setup/Toggl/Toggl-failure.vue";
import ServerSetup from "./Setup/Server/ServerSetup.vue";
import AnkiHome from "./Setup/Anki/AnkiHome.vue";
import AnkiConnect from "./Setup/Anki/AnkiConnect.vue";
import AnkiSuccess from "./Setup/Anki/AnkiSuccess.vue";
import AnkiFailure from "./Setup/Anki/AnkiFailure.vue";
import MacosPermissions from "./Setup/Other/Macos-permissions.vue";
import AnkiManualConnect from "./Setup/Anki/AnkiManualConnect.vue";
import AnkiReading from "./Setup/Anki/AnkiReading.vue";
import PickFilename from "./Setup/Other/Pick-Filename.vue";
import SetupComplete from "./Setup/Other/SetupComplete.vue";

const routes:RouteRecordRaw[] = [
    { path: '/', component: PageSelector },
    { path: '/setup/index', component: SetupIndex },
    { path: '/setup/macos-permissions', component: MacosPermissions },
    { path: '/setup/client-server-selection', component: SetupClientServerSelection  },
    { path: '/setup/server-setup', component: ServerSetup },
    { path: '/setup/toggl-home', component: TogglHome },
    { path: '/setup/toggl-manual-connect', component: TogglManualConnect },
    { path: '/setup/toggl-connect', component: TogglConnect },
    { path: '/setup/toggl-success', component: TogglSuccess },
    { path: '/setup/toggl-failure', component: TogglFailure },
    { path: '/setup/anki-home', component: AnkiHome },
    { path: '/setup/anki-connect', component: AnkiConnect },
    { path: '/setup/anki-success', component: AnkiSuccess },
    { path: '/setup/anki-failure', component: AnkiFailure },
    { path: "/setup/anki-manual-connect", component: AnkiManualConnect },
    { path: "/setup/anki-reading", component: AnkiReading },
    { path: "/setup/pick-filename", component: PickFilename },
    { path: "/setup/complete", component: SetupComplete },
  ]

export default routes;