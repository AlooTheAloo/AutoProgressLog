<script setup lang="ts">
import Button from "primevue/button";
import DataView from "primevue/dataview";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import dayjs, { Dayjs } from "dayjs";
import ProgressSpinner from "primevue/progressspinner";
import { PageState } from "primevue/paginator";
import Skeleton from "primevue/skeleton";
import score from "../../../src/assets/rewarded.png";
import ConfirmPopup from "primevue/confirmpopup";
import { useConfirm } from "primevue/useconfirm";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { motion, AnimatePresence } from "motion-v";
import { CopyReportToast } from "../../../electron/main/Electron-Backend/ReportsListeners";
import pluralize from "pluralize";

const rows = 6;
const router = useRouter();

type ListReport = {
  id: string;
  score: number;
  date: Dayjs;
  fileExists: boolean;
  revertable?: boolean;
};

async function getReports() {
  return new Promise<void>((res, rej) => {
    window.ipcRenderer.invoke("Get-Reports").then((data: any) => {
      reports.value = data.map((x: any) => {
        return {
          ...x,
          date: dayjs(x.date),
        };
      });
      res();
    });
  });
}

let lastFrom = 0;

async function getImages(from: number, count: number) {
  lastFrom = from;
  return new Promise<void>((res, rej) => {
    window.ipcRenderer
      .invoke("Get-Images", from, from + count)
      .then((data: { start: number; images: string[] }) => {
        if (data.start == lastFrom) {
          images.value = data.images;
        }
        res();
      });
  });
}

function openImage(id: string) {
  window.ipcRenderer.invoke("Get-Image", id).then((x) => {
    imageViewerImage.value = {
      image: x,
      id: id,
      shown: true,
    };
  });
}

onMounted(() => {
  window.ipcRenderer.invoke("loadReportsPage").then(() => {
    getReports();
    getImages(0, rows);
  });
});

const reverting = ref<boolean>(false);
const confirm = useConfirm();

function revertReport(evt: Event) {
  confirm.require({
    target: evt.currentTarget as HTMLElement,
    header: "Revert Report",
    message:
      "Are you sure you want to revert this report? \n You cannot undo this action.",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Revert",
      severity: "danger",
    },
    accept: () => {
      images.value = undefined;
      reverting.value = true;
      window.ipcRenderer.invoke("Reverse-Report").then(async (x) => {
        await getReports();
        await getImages(0, rows);
        reverting.value = false;
      });
    },
    reject: () => {},
  });
}

const reports = ref<ListReport[] | undefined>(undefined);
const images = ref<string[] | undefined>(undefined);
const first = ref<number>(0);

const pageChanged = (event: PageState) => {
  getImages(event.first, event.rows);
  first.value = event.first;
};

function openReport(id: string) {
  window.ipcRenderer.invoke("Open-Report", id);
}

const toast = useToast();
function copyReport(id: string) {
  window.ipcRenderer.invoke("Copy-Report", id).then((ret: CopyReportToast) => {
    if (!ret.worked) {
      toast.add({
        severity: "error",
        summary: "Failed to copy report!",
        detail: "We were unable to copy the report to your clipboard.",
        life: 5000,
      });
    } else {
      toast.add({
        severity: "success",
        summary: "Report copied!",
        detail: `Report #${ret.reportNo} was copied to your clipboard.`,
        life: 5000,
      });
    }
  });
}

const imageViewerImage = ref<{ image?: string; id?: string; shown: boolean }>({
  image: undefined,
  id: undefined,
  shown: false,
});

function nf(num: number) {
  return new Intl.NumberFormat("en-US", { useGrouping: true }).format(num);
}
</script>

<template>
  <Toast />

  <Dialog
    v-model:visible="imageViewerImage.shown"
    modal
    :dismissableMask="true"
    :draggable="false"
    :header="`Report # ${imageViewerImage?.id}`"
    :style="{ overflow: 'hidden' }"
  >
    <div class="flex-col flex h-[60vh]">
      <img
        class="mx-auto rounded-lg h-full"
        :src="'data:image/png;base64,' + imageViewerImage?.image"
      />
    </div>
  </Dialog>

  <ConfirmPopup />
  <div
    v-if="!reports"
    class="flex flex-col w-full h-full items-center justify-center"
  >
    <ProgressSpinner />
  </div>
  <div
    v-else-if="reports.length == 0"
    class="flex flex-col w-full h-full items-center justify-center"
  >
    <div class="flex flex-col flex-grow w-full h-full">
      <div
        class="flex w-full h-full items-center px-10 my-5 justify-center flex-col"
      >
        <div class="flex flex-col">
          <h1
            class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]"
          >
            No reports have been generated yet
          </h1>
          <h2 class="text-xl text-center w-full my-2">
            Create a report and come back to see your progress!
          </h2>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col w-full h-full">
    <div class="flex flex-col flex-grow w-full h-full">
      <div class="flex w-full h-20 items-center px-10 my-5 justify-between">
        <div class="flex flex-col">
          <h1
            class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]"
          >
            Generated Reports
          </h1>
        </div>
      </div>
      <div class="flex w-full px-10 flex-grow reportListview">
        <div class="flex w-full px-2 py-2 h-fit rounded-lg">
          <DataView
            dataKey=""
            :value="reports"
            class="w-full rounded-lg"
            :paginator="reports.length > rows"
            :rows="rows"
            v-on:page="pageChanged"
            :first="first"
          >
            <template #list="slotProps">
              <div class="flex flex-col">
                <AnimatePresence :key="first">
                  <motion.div
                    v-for="(item, index) in slotProps.items as ListReport[]"
                    :key="index + first"
                    :initial="{ x: 50, opacity: 0, filter: 'blur(10px)' }"
                    :while-in-view="{ x: 0, opacity: 1, filter: 'blur(0px)' }"
                    :transition="{
                      delay: index * 0.01,
                    }"
                    :exit="{ opacity: 0 }"
                  >
                    <div class="py-2 flex">
                      <div
                        class="w-full flex flex-col sm:flex-row sm:items-center gap-4 dark:bg-black bg-[#eeeeef] overflow-hidden rounded-md pr-5"
                      >
                        <div class="w-3 h-full bg-[#24CAFF]"></div>
                        <div class="w-14 py-4">
                          <div v-if="images == undefined" class="w-14 h-14">
                            <Skeleton height="3.5rem"></Skeleton>
                          </div>
                          <div
                            v-else
                            class="h-14 flex items-center justify-center"
                          >
                            <div
                              role="button"
                              @click="openImage(item.id)"
                              class="z-10 text-neutral-100 opacity-0 hover:opacity-100 bg-black/20 w-full h-full flex justify-center items-center transition-all duration-200"
                              v-if="(images ?? [])[index] != ''"
                            >
                              <i class="pi pi-search-plus"></i>
                            </div>
                            <img
                              role="button"
                              tabindex="0"
                              @keydown.enter="openImage(item.id)"
                              @keydown.space.prevent="openImage(item.id)"
                              v-if="(images ?? [])[index] != ''"
                              class="absolute mx-auto rounded-sm h-14 hover:opacity-80 transition-all duration-200"
                              :src="
                                'data:image/png;base64,' + (images ?? [])[index]
                              "
                              :alt="item.id"
                            />
                            <div v-else class="text-xs text-center">
                              No image available
                            </div>
                          </div>
                        </div>
                        <div
                          class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
                        >
                          <div
                            class="flex flex-row md:flex-col justify-between items-start"
                          >
                            <div class="flex items-center gap-2">
                              <div class="text-lg font-medium">
                                Report #{{ item.id }}
                              </div>

                              <span
                                class="font-medium text-surface-500 dark:text-surface-400 text-sm text-[#24CAFF] italic"
                              >
                                <span v-if="item.date.isSame(dayjs(), 'd')">
                                  Today
                                </span>
                                <span
                                  v-else-if="item.date.diff(dayjs(), 'd') == -1"
                                >
                                  Yesterday
                                </span>
                                <span v-else>
                                  {{ item.date.format("Do") }}
                                  of
                                  {{ item.date.format("MMMM").toLowerCase() }}
                                  {{ item.date.format("YYYY") }}
                                </span>

                                at
                                {{ item.date.format("h:mm a") }}
                              </span>
                            </div>
                            <div class="gap-2 flex mt-1">
                              <div
                                class="flex bg-white items-center px-2 rounded-lg h-6"
                              >
                                <img :src="score" class="w-4 h-4 invert" />
                                <span
                                  class="ml-2 font-medium text-black text-sm"
                                  >{{
                                    nf(item.score) + " " + pluralize("pt")
                                  }}</span
                                >
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col md:items-end gap-8">
                            <div class="flex flex-col md:flex-row gap-2">
                              <Button
                                v-if="item.revertable"
                                severity="danger"
                                :disabled="reverting"
                                @click="revertReport($event)"
                                class="h-8"
                              >
                                <i
                                  v-if="reverting"
                                  :class="[
                                    'pi',
                                    'pi-spinner pi-spin text-white',
                                  ]"
                                />
                                <i v-else class="pi pi-undo text-white" />
                              </Button>

                              <Button
                                v-on:click="copyReport(item.id)"
                                icon="pi pi-clipboard"
                                label=""
                                :disabled="!item.fileExists"
                                v-tooltip.top="{
                                  value: item.fileExists
                                    ? ''
                                    : 'Report file could not be found',
                                  pt: {
                                    arrow: {
                                      style: {
                                        backgroundColor: '',
                                      },
                                    },
                                    text: {
                                      style: {
                                        fontSize: '0.6rem',
                                        textAlign: 'center',
                                        color: 'white',
                                      },
                                    },
                                  },
                                }"
                                class="flex-auto md:flex-initial whitespace-nowrap h-8"
                              ></Button>
                              <Button
                                v-on:click="openReport(item.id)"
                                icon="pi pi-folder-open"
                                label="Open"
                                :disabled="!item.fileExists"
                                v-tooltip.top="{
                                  value: item.fileExists
                                    ? ''
                                    : 'Report file could not be found',
                                  pt: {
                                    arrow: {
                                      style: {
                                        backgroundColor: '',
                                      },
                                    },
                                    text: {
                                      style: {
                                        fontSize: '0.6rem',
                                        textAlign: 'center',
                                        color: 'white',
                                      },
                                    },
                                  },
                                }"
                                class="flex-auto md:flex-initial whitespace-nowrap h-8"
                              ></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </template>
          </DataView>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.reportListview {
  --p-dataview-content-background: transparent !important;
  --p-paginator-background: transparent !important;
  --p-dataview-paginator-bottom-border-width: 0px !important;
}
</style>
