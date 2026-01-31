<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from "vue";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import dayjs from "dayjs";
import DashboardBody from "../../components/Dashboard/DashboardBody.vue";
import { Maybe } from "../../../types/Maybe";
import Skeleton from "primevue/skeleton";
import Dialog from "primevue/dialog";
import Report from "../../assets/Report.png";

import Hey from "../../assets/Hey !.gif";
import { Options } from "../../../apl-backend/types/options";
import { DashboardDTO } from "../../../electron/main/Electron-Backend/types/Dashboard";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

const generating_report = ref<boolean>(false);
const syncing = ref<boolean>(false);

const dto = ref<DashboardDTO>();
const lastSyncTime = ref<string>("");
const config = ref<Options>();
const toast = useToast();

const disableActionButtons = computed(
  () => generating_report.value || syncing.value,
);

async function generateReport() {
  try {
    generating_report.value = true;
    const maybe: Maybe<DashboardDTO> =
      await window.ipcRenderer.invoke("GenerateReport");
    if (!("error" in maybe)) {
      dto.value = maybe;
    } else {
      if (
        maybe.error === "RATE_LIMIT" ||
        maybe.message === "You are creating reports too fast"
      ) {
        toast.add({
          severity: "error",
          summary: "Woah, slow down!",
          detail: "You are creating reports too fast. Please wait a moment.",
          life: 3000,
        });
      }
    }
  } catch (error) {
    console.error("Error generating report:", error);
    toast.add({
      severity: "error",
      summary: "An error has occurred",
      detail:
        "An error has occurred while generating your report. More information : " +
        error,
      life: 3000,
    });
  } finally {
    generating_report.value = false;
  }
}

async function sync() {
  syncing.value = true;
  try {
    const maybe: DashboardDTO | undefined =
      await window.ipcRenderer.invoke("Sync");
    if (maybe) {
      dto.value = maybe;
    }
  } catch (error) {
    console.error("Error syncing:", error);
  } finally {
    syncing.value = false;
    lastSyncTime.value = getLastSyncTime();
  }
}

onMounted(async () => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    config.value = data;
  });

  try {
    syncing.value = true;
    const data: DashboardDTO =
      await window.ipcRenderer.invoke("Get-Dashboard-DTO");
    console.log(data);
    dto.value = data;

    await sync();
    const s = await window.ipcRenderer.invoke("isSyncing");
    generating_report.value = s;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  // Every minute, update lastSyncTime text
  const syncIntervalId = setInterval(
    () => {
      lastSyncTime.value = getLastSyncTime();
    },
    60 * 1 * 1000,
  );

  onUnmounted(() => {
    clearInterval(syncIntervalId);
  });
});

window.ipcRenderer.on("ShowWelcomeMessage", () => {
  firstDialog.value = true;
  console.log("wow");
});

const getLastSyncTime = () => {
  console.log("Lastsynctime : " + dto.value?.lastSyncTime);
  if (!dto.value?.lastSyncTime) return "";
  return dayjs.duration(-dayjs().diff(dto.value.lastSyncTime)).humanize(true);
};

const firstDialog = ref(false);

const closeFirstDialog = () => {
  firstDialog.value = false;
};
</script>

<template>
  <Toast />
  <Dialog v-model:visible="firstDialog" modal :style="{ width: '25rem' }" :dismissableMask="true">
    <template #container="{ closeCallback }">
      <div class="w-full relative">
        <img :src="Hey" class="rounded-lg w-full h-full" />
        <div class="absolute inset-0 flex items-center justify-center text-3xl font-bold gap-5"></div>
      </div>
      <div class="font-bold flex flex-col gap-4 py-6 px-5 bg-black rounded-b-[1rem]">
        <div class="text-2xl">Hey! Good to have you here!</div>
        <div class="text-sm text-gray-400 flex flex-col gap-2">
          This app is in very early beta and is in continuous development.
          <div class="">
            If you have any issues, bugs or feedback, please let us know on the
            <a class="text-blue-200 underline" href="https://github.com/AlooTheAloo/AutoProgressLog"
              target="_blank">GitHub</a>.
          </div>
          We're super excited to see what your learning journey looks like!
        </div>
        <Button severity="info" v-on:click="closeFirstDialog">
          <div class="text-black">Understood!</div>
        </Button>
      </div>
    </template>
  </Dialog>
  <div v-if="!dto" class="flex flex-col w-full h-full items-center justify-center">
    <ProgressSpinner />
  </div>
  <div v-else class="flex flex-col w-full h-full overflow-auto">
    <div style="
        display: flex;
        flex-direction: column;
        /* ensure scroll or clip occurs if overflow */
        height: 100%;
      " class="flex flex-col flex-grow w-full h-full items-center my-5">
      <div class="mt-auto"></div>
      <div class="flex w-[45rem] 1720:w-[91rem] h-20 items-center mb-5 justify-between gap-5">
        <div>
          <img :src="`${dto.profile_picture}?v=${dayjs().valueOf()}`"
            class="w-16 h-16 rounded-full dark:bg-black bg-white border-2 dark:border-[#e0e0e0] border-[#3d3e42]" />
        </div>
        <div class="flex flex-col w-0 flex-grow text-black dark:text-white">
          <h1 class="flex items-center gap-2 py-2 bg-gradient-to-r text-lg 1720:text-2xl font-bold">
            <span class="whitespace-nowrap">Welcome back,</span>

            <div v-if="dto.userName == undefined">
              <Skeleton width="10rem" height="2rem" />
            </div>
            <div v-else class="flex-grow truncate">
              {{ dto.userName }}
            </div>
          </h1>
          <div class="flex items-center syncNowButton gap-2">
            <div class="1720:text-base text-sm font-bold flex items-center gap-1.5">
              Last synced
              <div v-if="lastSyncTime == ''">
                <Skeleton width="8rem" height="1.5rem" />
              </div>
              <div v-else>
                {{ lastSyncTime }}
              </div>
            </div>
            <Button class="h-7 mx-1 px-4  hover:opacity-90 flex items-center justify-center gap-2" :style="{
              backgroundColor: 'var(--primary-color)',
              border: 'none',
              borderRadius: '2rem',
              padding: '0 0.8rem'
            }" @click="() => sync()" :loading="disableActionButtons">
              <i :class="[
                'pi',
                disableActionButtons ? 'pi-spinner pi-spin' : 'pi-sync',
                'text-white',
              ]" />
              <span class="font-bold text-white 1720:text-base text-sm">
                Sync Now
              </span>
            </Button>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2 w-fit flex-shrink-0 generateButton">
          <Button severity="info" @click="generateReport" :disabled="disableActionButtons"
            class="flex items-center !rounded-full px-6 py-3 h-[2.5rem]">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
              <path
                d="M700-220v80q0 8 6 14t14 6q8 0 14-6t6-14v-80h80q8 0 14-6t6-14q0-8-6-14t-14-6h-80v-80q0-8-6-14t-14-6q-8 0-14 6t-6 14v80h-80q-8 0-14 6t-6 14q0 8 6 14t14 6h80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v200q0 17-11.5 28.5T800-520q-17 0-28.5-11.5T760-560v-200H200v560h200q17 0 28.5 11.5T440-160q0 17-11.5 28.5T400-120H200Zm0-120v40-560 243-3 280Zm80-80q0 17 11.5 28.5T320-280h83q17 0 28.5-11.5T443-320q0-17-11.5-28.5T403-360h-83q-17 0-28.5 11.5T280-320Zm0-160q0 17 11.5 28.5T320-440h200q17 0 28.5-11.5T560-480q0-17-11.5-28.5T520-520H320q-17 0-28.5 11.5T280-480Zm0-160q0 17 11.5 28.5T320-600h320q17 0 28.5-11.5T680-640q0-17-11.5-28.5T640-680H320q-17 0-28.5 11.5T280-640ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Z" />
            </svg>

            <span class="text-white font-bold text-lg">Generate Report</span>
          </Button>
          <div :class="`flex rounded-md bg-white h-8 text-black overflow-hidden z-10 ${disableActionButtons ? 'opacity-50' : ''
            }`" v-if="true">
            <div class="bg-[var(--primary-color)] p-2">
              <img :src="Report" class="w-full h-full" />
            </div>
            <div :class="`flex items-center px-2 font-semibold 1720:text-base xl:mx-2 text-xs`">
              <div>
                Next generated report
                {{ dayjs(dto?.nextReport).fromNow() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full px-0 lg:px-10 1720:mt-10">
        <DashboardBody :dto="dto" :syncing="generating_report" />
      </div>
      <div class="mt-auto"></div>
    </div>
  </div>
</template>

<style>
.generateButton>.p-button-info {
  background-color: var(--primary-color) !important;
  border: 1px solid var(--primary-color) !important;
}

.syncNowButton>.p-button {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
