<script setup lang="ts">
import { useRouter } from "vue-router";
import Logo from "../../assets/Logo.png";
import LogoDark from "../../assets/Logo-Dark.png";
import Tooltip from "primevue/tooltip";
import { appPath as AppPath } from "../../pages/routes/appRoutes";
import { computed, onMounted, onUnmounted, ref } from "vue";
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
import { useWindowSize } from "@vueuse/core";
import { AnimatePresence, motion } from "motion-v";

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

const bottomRoutes = [
  {
    path: "/app/settings",
    image: Settings,
    name: "Settings",
  },
  {
    path: "/app/help",
    image: Help,
    name: "Help",
  },
];

const { width } = useWindowSize();
const requestedSidebarState = ref<boolean>(false);

const sidebarState = computed(() => {
  if (width.value < 1280) {
    return false;
  } else {
    return requestedSidebarState.value;
  }
});

const handleClick = (path: string | undefined) => {
  if (!path) return;
  if (path == router.currentRoute.value.path) return;
  router.push(path);
};

const props = defineProps<{
  currentRoute: AppPath;
}>();

const updateInfo = ref<UpdateInfo | null>(null);
const glow = ref<boolean>(false);

onMounted(() => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    console.log(data);
    glow.value = data.appearance.glow;
  });
  window.ipcRenderer.on("config-change", (e, args: Options) => {
    glow.value = args.appearance.glow;
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
  // window.ipcRenderer.removeAllListeners();
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
  <!-- glow -->
  <div
    class="h-screen w-screen absolute overflow-hidden pointer-events-none"
    v-if="glow"
  >
    <div class="flex absolute w-full h-full justify-end">
      <div
        style="filter: blur(150px)"
        class="glow glow-delay w-[30rem] h-[30rem] absolute rounded-full bg-[#24CAFF] -mt-52 -mr-52"
      />
    </div>
    <!-- <div class="w-24 xl:w-72 transition-all duration-250 h-full">
          <div
            style="filter: blur(75px)"
            class="glow w-96 h-96 rounded-full bg-[#24CAFF] z-0 -ml-64 -mt-64"
          ></div>
        </div> -->
  </div>

  <div
    class="flex w-screen h-screen overflow-hidden dark:bg-[#0e0e0e35] bg-[#fbfbfb]"
  >
    <div
      class="flex flex-col border-r-[1px] border-[#e0e0e0] dark:border-[#3d3e42] bg-[#f3f3f4] dark:bg-[#1B1B1B] p-3 transition-all duration-250"
      :class="{
        'w-20': !sidebarState,
        'w-48': sidebarState,
      }"
    >
      <motion.div
        layoutRoot
        :transition="{
          type: 'spring',
          ease: 'easeInOut',
          duration: 5,
        }"
        class="flex justify-between h-24"
        :class="{
          'flex-col': !sidebarState,
        }"
      >
        <!-- Logo  -->
        <!-- Sidebar here -->
        <div class="flex">
          <div class="w-full z-10 p-3 pointer-events-none">
            <img
              :src="Logo"
              class="transition-all duration-200 hidden dark:block"
              :class="{ 'w-[2rem]': !sidebarState, 'w-16': sidebarState }"
            />

            <img
              :src="LogoDark"
              class="transition-all duration-200 dark:hidden"
              :class="{ 'w-[2rem]': !sidebarState, 'w-16': sidebarState }"
            />
          </div>
        </div>
        <AnimatePresence>
          <motion.button
            :initial="{ opacity: 0, filter: 'blur(10px)' }"
            :animate="{ opacity: 1, filter: 'blur(0px)' }"
            :exit="{ opacity: 0, filter: 'blur(10px)' }"
            :transition="{ duration: 0.5, ease: 'easeInOut' }"
            v-if="width >= 1280"
            key="sidebar-button"
            @click="requestedSidebarState = !requestedSidebarState"
          >
            <i class="pi pi-bars text-black dark:text-white" key="bars"></i>
          </motion.button>
        </AnimatePresence>
      </motion.div>

      <!-- Navigation  -->
      <div class="flex flex-col gap-4 w-full mt-20 flex-grow">
        <button
          v-for="route in routes"
          :style="{
            cursor: route.path != null ? 'pointer' : 'default',
            opacity: route.path == null ? 0.5 : 1,
            backgroundColor: route.path == props.currentRoute ? '#1295BF' : '',
          }"
          v-tooltip.right="route.path == null ? 'Coming soon!' : undefined"
          :key="route.path"
          class="rounded-[5px] px-4 py-1 flex items-center gap-2 w-full transition-all duration-200"
          v-on:click="(e) => handleClick(route.path)"
          @click.stop
          :tabindex="route.path == null ? -1 : 0"
        >
          <img
            :src="route.image"
            class="invert dark:invert-0 w-6 h-6 pointer-events-none"
          />
          <AnimatePresence>
            <motion.div
              v-if="sidebarState"
              key="caca"
              class="font-bold text-black dark:text-white text-md"
              :initial="{
                opacity: 0,
                filter: 'blur(10px)',
              }"
              :while-in-view="{
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
              }"
              :exit="{
                opacity: 0,
                filter: 'blur(10px)',
                position: 'absolute',
              }"
              :transition="{
                duration: 0,
                ease: 'easeInOut',
              }"
            >
              {{ route.name }}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      <!-- Settings and help  -->

      <div class="flex flex-col gap-4 w-full flex-grow justify-end">
        <button
          v-for="route in bottomRoutes"
          :style="{
            cursor: route.path != null ? 'pointer' : 'default',
            opacity: route.path == null ? 0.5 : 1,
            backgroundColor: route.path == props.currentRoute ? '#1295BF' : '',
          }"
          :key="route.path"
          class="rounded-[5px] px-4 py-1 flex items-center gap-2 w-full transition-all duration-200"
          v-on:click="(e) => handleClick(route.path)"
          @click.stop
        >
          <img :src="route.image" class="invert dark:invert-0 w-6 h-6" />
          <AnimatePresence>
            <motion.div
              v-if="sidebarState"
              key="caca"
              class="font-bold dark:text-white text-black text-md"
              :initial="{
                opacity: 0,
                filter: 'blur(10px)',
              }"
              :while-in-view="{
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
              }"
              :exit="{
                opacity: 0,
                filter: 'blur(10px)',
                position: 'absolute',
              }"
              :transition="{
                duration: 0,
                ease: 'easeInOut',
              }"
            >
              {{ route.name }}
            </motion.div>
          </AnimatePresence>
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
