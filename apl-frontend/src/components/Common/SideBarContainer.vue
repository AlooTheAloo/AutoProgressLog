<script setup lang="ts">
import { useRouter } from "vue-router";
import Logo from "../../assets/Logo.png";
import LogoDark from "../../assets/Logo-Dark.png";
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
  Tools,
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
import ImmersionPill from "../ImmersionPill.vue";

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
  // {
  //   path: "/app/utilities",
  //   image: Tools,
  //   name: "Utilities",
  // },
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
  showSidebar: boolean | null;
}>();

const updateInfo = ref<UpdateInfo | null>(null);
const glow = ref<boolean>(false);

onMounted(() => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    if (data == null) return;
    glow.value = data.localOptions.appearance.glow;
  });
  window.ipcRenderer.on("config-change", (e, args: Options) => {
    glow.value = args.localOptions.appearance.glow;
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
          class="markdown-body whitespace-normal text-black dark:text-white py-4"
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
    <div v-html="dialog?.content" class="text-black dark:text-white"></div>
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
        class="glow glow-delay w-[30rem] h-[30rem] absolute rounded-full bg-[var(--primary-color)] -mt-52 -mr-52"
      />
    </div>
    <!-- <div class="w-24 xl:w-72 transition-all duration-250 h-full">
          <div
            style="filter: blur(75px)"
            class="glow w-96 h-96 rounded-full bg-[var(--primary-color)] z-0 -ml-64 -mt-64"
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
        'w-80': sidebarState,
      }"
      v-if="props.showSidebar ?? false"
    >
      <motion.div
        layoutRoot
        :transition="{
          type: 'spring',
          ease: 'easeInOut',
          duration: 5,
        }"
        class="flex items-center justify-between h-24 relative"
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
            class="absolute -right-8 top-[31px] bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-gray-700 p-1.5 rounded-full shadow-md z-50 flex items-center justify-center"
            :initial="{ opacity: 0, scale: 0.8 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.8 }"
            :transition="{ duration: 0.2, ease: 'easeInOut' }"
            v-if="width >= 1280"
            key="sidebar-button"
            @click="requestedSidebarState = !requestedSidebarState"
          >
            <svg
              v-if="sidebarState"
              key="open-icon"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-black dark:text-white"
            >
              <path
                d="M22 21.3333V10.6667L16.6667 16L22 21.3333ZM6.66667 28C5.93333 28 5.30556 27.7389 4.78333 27.2167C4.26111 26.6944 4 26.0667 4 25.3333V6.66667C4 5.93333 4.26111 5.30556 4.78333 4.78333C5.30556 4.26111 5.93333 4 6.66667 4H25.3333C26.0667 4 26.6944 4.26111 27.2167 4.78333C27.7389 5.30556 28 5.93333 28 6.66667V25.3333C28 26.0667 27.7389 26.6944 27.2167 27.2167C26.6944 27.7389 26.0667 28 25.3333 28H6.66667ZM10.6667 25.3333V6.66667H6.66667V25.3333H10.6667ZM13.3333 25.3333H25.3333V6.66667H13.3333V25.3333Z"
                fill="currentColor"
              />
            </svg>
            <svg
              v-else
              key="closed-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-black dark:text-white"
            >
              <path
                d="M12.5 9.2V14.8C12.5 15.0333 12.6 15.1917 12.8 15.275C13 15.3583 13.1833 15.3167 13.35 15.15L15.8 12.7C16 12.5 16.1 12.2667 16.1 12C16.1 11.7333 16 11.5 15.8 11.3L13.35 8.85C13.1833 8.68333 13 8.64167 12.8 8.725C12.6 8.80833 12.5 8.96667 12.5 9.2ZM5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM8 19V5H5V19H8ZM10 19H19V5H10V19Z"
                fill="currentColor"
              />
            </svg>
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
            backgroundColor:
              route.path == props.currentRoute ? 'var(--primary-color)' : '',
          }"
          v-tooltip.right="route.path == null ? 'Coming soon!' : undefined"
          :key="route.path"
          class="rounded-[5px] px-4 py-1 flex items-center gap-2 w-full transition-all duration-200"
          v-on:click="(e: MouseEvent) => handleClick(route.path)"
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
              key="routeName"
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
            backgroundColor:
              route.path == props.currentRoute ? 'var(--primary-color)' : '',
          }"
          :key="route.path"
          class="rounded-[5px] px-4 py-1 flex items-center gap-2 w-full transition-all duration-200"
          v-on:click="(e: MouseEvent) => handleClick(route.path)"
          @click.stop
        >
          <img :src="route.image" class="invert dark:invert-0 w-6 h-6" />
          <AnimatePresence>
            <motion.div
              v-if="sidebarState"
              key="bottomRouteNames"
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
    <ImmersionPill/>
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
