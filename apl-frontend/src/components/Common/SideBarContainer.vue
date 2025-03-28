<script setup lang="ts">
import { useRouter } from "vue-router";
import Logo from "../../assets/Logo.png";
import { appPath as AppPath } from "../../pages/routes/appRoutes";
import { onMounted, onUnmounted, ref } from "vue";
import Dialog from "primevue/dialog";
import {
  Overview,
  Reports,
  Competitions,
  Statistics,
  Settings,
  Help,
} from "../../assets/Icons/Sidebar/Icons";
import UserDialog from "../../../types/UserDialog";
import { UpdateInfo } from "electron-updater";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import { marked } from "marked";
import "github-markdown-css/github-markdown-dark.css";
import { Options } from "../../../apl-backend/types/options";

const HELP_PAGE_URL = "https://www.aplapp.dev/#/";
const router = useRouter();

interface route {
  path?: AppPath;
  image: string;
  name: string;
}

const routes: route[] = [
  {
    path: "/app/dashboard",
    image: Overview,
    name: "Overview",
  },
  {
    path: "/app/reports",
    image: Reports,
    name: "Reports",
  },
  {
    image: Competitions,
    name: "Competitions",
  },
  {
    image: Statistics,
    name: "Statistics",
  },
];

const handleClick = (path: string | undefined) => {
  if (!path) return;
  if (path == router.currentRoute.value.path) return;
  router.push(path);
};

const openHelpCenter = () => {
  window.ipcRenderer.invoke("OpenExternal", HELP_PAGE_URL);
};

const props = defineProps<{
  currentRoute: AppPath;
}>();

const updateInfo = ref<UpdateInfo | null>(null);
const glow = ref<boolean>(false);

onMounted(() => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    glow.value = data.appreance.glow;
  });
  window.ipcRenderer.on("config-change", (e, args: Options) => {
    glow.value = args.appreance.glow;
  });

  window.ipcRenderer.on("ShowDialog", (evt, args: UserDialog) => {
    dialog.value = args;
    visible.value = true;
  });

  window.ipcRenderer.on("update-available", (e, args: UpdateInfo) => {
    if (!(typeof args.releaseNotes == "string")) return;
    updateInfo.value = args;
    toastValue.value = {
      header: `An update is available!`,
      content: `${marked(args.releaseNotes)}`,
      footer: "",
      yes: {
        text: "Update now",
        on: () => {
          window.ipcRenderer.invoke("Update-App", args);
        },
      },
      no: {
        text: "Skip this version",
        on: () => {
          window.ipcRenderer.invoke("Skip-update", args.version);
          toastV.removeGroup("update");
        },
      },
    };
    toastV.add({ severity: "secondary", life: 9999999, group: "update" });
  });
});

onUnmounted(() => {
  window.ipcRenderer.removeAllListeners();
  window.ipcRenderer.removeAllListeners("update-available");
});

const toastV = useToast();

const dialog = ref<UserDialog>();
const visible = ref(false);

const toastValue = ref<UserDialog>();
</script>

<template>
  <Toast position="top-right" group="update">
    <template #message="slotProps">
      <div class="flex flex-col items-start flex-auto">
        <div class="flex items-center gap-2">
          <span class="font-bold">{{ toastValue?.header }}</span>
        </div>

        <div
          class="markdown-body whitespace-normal"
          v-html="toastValue?.content"
        ></div>

        <div class="flex gap-2">
          <Button
            size="small"
            :label="toastValue?.yes?.text"
            @click="toastValue?.yes?.on"
          ></Button>
          <Button
            size="small"
            :label="toastValue?.no?.text"
            severity="secondary"
            @click="toastValue?.no?.on"
          ></Button>
        </div>
      </div>
    </template>
  </Toast>

  <Dialog
    :header="dialog?.header"
    :footer="dialog?.footer"
    v-model:visible="visible"
    :modal="true"
    :dismissableMask="true"
  >
    <div v-html="dialog?.content"></div>
    <div class="flex gap-2">
      <Button
        v-if="dialog?.yes"
        severity="primary"
        :label="dialog?.yes?.text"
        @click="dialog?.yes?.on"
        class="mt-2"
      ></Button>
      <Button
        v-if="dialog?.no"
        severity="secondary"
        :label="dialog?.no?.text"
        @click="dialog?.no?.on"
        class="mt-2"
      ></Button>
    </div>
  </Dialog>
  <div
    class="h-screen w-screen absolute overflow-hidden pointer-events-none"
    v-if="glow"
  >
    <div class="flex absolute w-full h-full items-end justify-end">
      <div
        style="filter: blur(75px)"
        class="glow glow-delay w-96 h-96 absolute rounded-full bg-[#24CAFF] z-0 -mr-64 -mb-64"
      />
    </div>
    <div class="w-24 xl:w-72 transition-all duration-250 h-full">
      <div
        style="filter: blur(75px)"
        class="glow w-96 h-96 rounded-full bg-[#24CAFF] z-0 -ml-64 -mt-64"
      ></div>
    </div>
  </div>

  <div class="flex w-screen h-screen overflow-hidden">
    <div
      class="flex flex-col bg-[#1B1B1B] p-3 w-20 xl:w-72 items-center xl:items-start transition-all duration-250"
    >
      <!-- Sidebar here -->
      <!-- Logo  -->
      <div class="w-full z-10">
        <img :src="Logo" class="w-[4.5rem]" />
      </div>
      <!-- Navigation  -->
      <div class="flex flex-col gap-4 w-full mt-20 flex-grow">
        <div
          v-for="route in routes"
          :style="{
            cursor: route.path != null ? 'pointer' : 'default',
            opacity: route.path == null ? 0.5 : 1,
            backgroundColor: route.path == props.currentRoute ? '#24CAFF' : '',
          }"
          :key="route.path"
          class="xl:justify-start justify-center rounded-lg p-2 flex items-center gap-2 w-full h-12"
          v-on:click="(e) => handleClick(route.path)"
          @click.stop
        >
          <img :src="route.image" class="w-6 h-6" />
          <div class="font-semibold text-white xl:block hidden">
            {{ route.name }}
          </div>
        </div>
      </div>
      <!-- Settings and help  -->
      <div class="flex flex-col gap-2 w-full justify-end flex-grow">
        <router-link
          to="/app/settings"
          class="flex items-center xl:justify-start justify-center gap-2 w-full"
        >
          <div
            class="flex items-center xl:justify-start justify-center gap-2 w-full h-10 rounded-xl px-2"
            :style="{
              backgroundColor:
                props.currentRoute == '/app/settings' ? '#24CAFF' : '',
            }"
          >
            <img :src="Settings" class="w-6 h-6" />
            <div class="font-semibold text-white xl:block hidden">Settings</div>
          </div>
        </router-link>
        <button
          :onclick="openHelpCenter"
          class="flex items-center px-2 xl:justify-start justify-center gap-2 w-full"
        >
          <img :src="Help" class="w-6 h-6" />
          <div class="font-semibold text-white xl:block hidden">
            Help center
          </div>
        </button>
      </div>
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.glow {
  pointer-events: none;
  animation-name: breathe;
  animation-duration: 10s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
}

.glow-delay {
  animation-delay: -2s;
}

/* The animation code */
@keyframes breathe {
  from {
    width: 24rem;
    height: 24rem;
  }
  to {
    width: 18rem;
    height: 18rem;
  }
}

.markdown-body {
  box-sizing: border-box;
  background-color: unset;
  list-style-type: circle;
  list-style: circle;
}
</style>
