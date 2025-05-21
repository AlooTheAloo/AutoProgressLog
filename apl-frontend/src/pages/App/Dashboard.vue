<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import SideBarContainer from "../../components/Common/SideBarContainer.vue";
import { appPath } from "../routes/appRoutes";
import ProgressSpinner from "primevue/progressspinner";
import dayjs from "dayjs";
import DashboardBody from "../../components/Dashboard/DashboardBody.vue";
import { useMagicKeys } from "@vueuse/core";
import { Maybe } from "../../../types/Maybe";
import Skeleton from "primevue/skeleton";
import Dialog from "primevue/dialog";
import GrainyColor from "../../assets/GrainyColor.png";
import Report from "../../assets/Report.png";

import Logo from "../../assets/Logo.png";
import { Options } from "../../../apl-backend/types/options";
import { DashboardDTO } from "../../../electron/main/Electron-Backend/types/Dashboard";

const TIME_SYNC_INTERVAL = 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const router = useRouter();

const generating_report = ref<boolean>(false);
const syncing = ref<boolean>(false);

const dto = ref<DashboardDTO>();
const lastSyncTime = ref<string>("");
const config = ref<Options>();

const disableActionButtons = computed(
  () => generating_report.value || syncing.value
);

onUnmounted(() => {
  intervals.forEach((x) => clearInterval(x));
  intervals.length = 0;
  dto.value = undefined;
});

async function generateReport() {
  try {
    generating_report.value = true;
    const maybe: Maybe<DashboardDTO> = await window.ipcRenderer.invoke(
      "GenerateReport"
    );
    if (!("error" in maybe)) {
      dto.value = maybe;
    }
  } catch (error) {
    console.error("Error generating report:", error);
    // TODO : Handle error (e.g., show error message to user)
  } finally {
    generating_report.value = false;
  }
}

async function sync() {
  syncing.value = true;
  try {
    const maybe: Maybe<DashboardDTO> = await window.ipcRenderer.invoke("Sync");

    console.log(maybe);
    if (!("error" in maybe)) {
      dto.value = maybe;
      lastSyncTime.value = getLastSyncTime();
    }
  } catch (error) {
    console.error("Error syncing:", error);
  } finally {
    syncing.value = false;
  }
}

window.ipcRenderer.on("SetSync", (evt, newSync: boolean) => {
  generating_report.value = newSync;
});

onUnmounted(() => {
  intervals.forEach((x) => clearInterval(x));
  intervals.length = 0;
});

onMounted(async () => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    config.value = data;
  });

  try {
    syncing.value = true;
    const data: DashboardDTO = await window.ipcRenderer.invoke(
      "Get-Dashboard-DTO"
    );
    console.log(data);
    dto.value = data;

    if (data.syncCount == 1) {
      firstDialog.value = true;
    }

    await sync();
    const s = await window.ipcRenderer.invoke("isSyncing");
    generating_report.value = s;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  intervals.push(
    setInterval(() => {
      sync();
    }, THIRTY_MINUTES)
  );

  intervals.push(
    setInterval(() => {
      lastSyncTime.value = getLastSyncTime();
    }, TIME_SYNC_INTERVAL)
  );
});

const intervals: Timer[] = [];

const getLastSyncTime = () => {
  if (!dto.value?.lastSyncTime) return "";
  return dayjs.duration(-dayjs().diff(dto.value.lastSyncTime)).humanize(true);
};

const firstDialog = ref(false);

const closeFirstDialog = () => {
  firstDialog.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="firstDialog"
    modal
    :style="{ width: '25rem' }"
    :dismissableMask="true"
  >
    <template #container="{ closeCallback }">
      <div class="w-full relative">
        <img :src="GrainyColor" class="rounded-lg w-full h-full" />
        <div
          class="absolute inset-0 flex items-center justify-center text-3xl font-bold gap-5"
        >
          <img :src="Logo" class="w-14 h-14 mr-2 bg-black" />
          <div>Hey! ✌️</div>
        </div>
      </div>
      <div
        class="font-bold flex flex-col gap-4 py-6 px-5 bg-black rounded-b-[1rem]"
      >
        <div class="text-2xl">Hey! Good to have you here!</div>
        <div class="text-sm text-gray-400 flex flex-col gap-2">
          This app is in very early beta and is in continuous development.
          <div class="">
            If you have any issues, bugs or feedback, please let us know on the
            <a
              class="text-blue-200 underline"
              href="https://github.com/AlooTheAloo/AutoProgressLog"
              target="_blank"
              >GitHub</a
            >.
          </div>
          We're super excited to see what your learning journey looks like!
        </div>
        <Button severity="info" v-on:click="closeFirstDialog">
          <div class="text-white">Understood!</div>
        </Button>
      </div>
    </template>
  </Dialog>
  <div
    v-if="!dto"
    class="flex flex-col w-full h-full items-center justify-center"
  >
    <ProgressSpinner />
  </div>
  <div v-else class="flex flex-col w-full h-full overflow-auto">
    <div class="flex flex-col flex-grow w-full h-full items-center">
      <div
        class="flex w-[45rem] 1720:w-[91rem] h-20 items-center my-5 justify-between gap-5"
      >
        <div>
          <img
            v-if="dto.profile_picture.isUrl"
            :src="dto.profile_picture.buffer"
            class="w-16 h-16 rounded-full dark:bg-black bg-white border-2 dark:border-[#e0e0e0] border-[#3d3e42]"
          />
          <div v-else>
            <img
              :src="'data:image/png;base64,' + dto.profile_picture.buffer"
              class="w-16 h-16 rounded-full dark:bg-black bg-white border-2 dark:border-[#e0e0e0] border-[#3d3e42]"
            />
          </div>
        </div>
        <div class="flex flex-col w-0 flex-grow text-black dark:text-white">
          <h1
            class="flex items-center gap-2 bg-gradient-to-r text-lg 1720:text-2xl font-bold"
          >
            <span class="">Welcome back,</span>

            <div v-if="dto.userName == undefined">
              <Skeleton width="10rem" height="2rem" />
            </div>
            <div class="flex-grow truncate" v-else>{{ dto.userName }} !</div>
          </h1>
          <div class="flex items-center syncNowButton">
            <div
              class="1720:text-base text-sm font-bold flex items-center gap-1.5"
            >
              Last synced
              <div v-if="lastSyncTime == ''">
                <Skeleton width="10.2rem" height="1.5rem" />
              </div>
              <div v-else>
                {{ lastSyncTime }}
              </div>
            </div>
            <Button
              class="h-6 mx-1"
              plain
              text
              @click="() => sync()"
              :loading="disableActionButtons"
            >
              <span class="font-semibold text-[#22A7D1] 1720:text-base text-sm"
                >Sync Now</span
              >
              <i
                :class="[
                  'pi',
                  disableActionButtons ? 'pi-spinner pi-spin' : 'pi-sync',
                  'text-[#00E0FF]',
                ]"
              />
            </Button>
          </div>
        </div>
        <div
          class="flex flex-col items-end gap-2 w-fit flex-shrink-0 generateButton"
        >
          <Button
            severity="info"
            @click="generateReport"
            :disabled="disableActionButtons"
            aschild
          >
            <i class="pi pi-plus-circle text-white mr-2" />
            <span class="text-white font-bold">Generate Report</span>
          </Button>
          <div
            :class="`flex rounded-md bg-white h-8 text-black overflow-hidden z-10 ${
              disableActionButtons ? 'opacity-50' : ''
            }`"
            v-if="config?.general.autogen.enabled"
          >
            <div class="bg-[#22A7D1] p-2">
              <img :src="Report" class="w-full h-full" />
            </div>
            <div
              :class="`flex items-center px-2 font-semibold 1720:text-base xl:mx-2 text-xs`"
            >
              <div>
                New generated report
                {{ dayjs(dto.nextReport).fromNow() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full px-10 flex-grow 1720:mt-10">
        <DashboardBody :dto="dto" :syncing="generating_report" />
      </div>
    </div>
  </div>
</template>

<style>
.generateButton > .p-button-info {
  background-color: #22a7d1 !important;
  border: 1px solid #22a7d1 !important;
}

.syncNowButton > .p-button {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
