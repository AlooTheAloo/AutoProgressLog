<script setup lang="ts">
import Button from "primevue/button";
import DataView from "primevue/dataview";
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import dayjs, { Dayjs } from "dayjs";
import { PageState } from "primevue/paginator";
import score from "../../../src/assets/rewarded.png";
import ConfirmPopup from "primevue/confirmpopup";
import { useConfirm } from "primevue/useconfirm";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import { motion, AnimatePresence } from "motion-v";
import pluralize from "pluralize";
import ExportableReport from "../../components/Common/ExportableReport.vue";
import { Layout, ReportData } from "../Report/src/types/report-data";
import { ProgressSpinner } from "primevue";
import { getGradientColors } from "../../utils/colormind";

const rows = 6;
const router = useRouter();

type ListReport = {
  id: string;
  score: {
    immersionScore: number;
    ankiScore: number;
    totalScore: number;
  };
  date: Dayjs;
  fileExists: boolean;
  revertable?: boolean;
};

type Page = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number;
  prevPage: number;
  data: ListReport[];
}

async function getReports(page: number) {
  return new Promise<void>((res, rej) => {
    window.ipcRenderer.invoke("Get-Reports", page, 6).then((page: Page) => {
      if(page.data.length == 0){
        reports.value = [];
        return;
      }
      // Fill array with nulls
      reports.value = Array.from({ length: page.total }, () => undefined);
      for(let i = 0; i < page.data.length; i++) {
        reports.value[(page.page - 1) * page.pageSize + i] = {
          ...page.data[i],
          date: dayjs(page.data[i].date)
        };
        console.log("Setting report " + ((page.page - 1) * page.pageSize + i) + " to " + JSON.stringify(page.data[i]));
      }
      res();
    });
  });
}

onMounted(() => {
  window.ipcRenderer.invoke("loadReportsPage").then(() => {
    getReports(0);
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
      reverting.value = true;
      // window.ipcRenderer.invoke("Reverse-Report").then(async (x) => {
      //   await getReports();
      //   reverting.value = false;
      // });
    },
    reject: () => {},
  });
}

const reports = ref<(ListReport|undefined)[] | undefined>(undefined);
const first = ref<number>(0);

const pageChanged = (event: PageState) => {
  first.value = event.first;
  getReports(event.page + 1);
};

const reportViewer = ref<{
  shown: boolean;
  reportData?: ReportData | null;
  layout?: Layout | null;
}>({
  shown: false,
  reportData: null,
  layout: null,
});

const exportableReportRef = ref<InstanceType<typeof ExportableReport> | null>(
  null
);

const LAYOUT_FULL = [
  ["mature", "ankidata", "ankistreak"],
  ["immersiondata", "immersionlog", "immersionstreak"],
];

const LAYOUT_ANKILESS = [
  ["immersionlog", "immersiondata"],
  ["moreimmersiondata", "immersionstreak"],
];

async function openReport(id: string) {
  const report: ReportData = await window.ipcRenderer.invoke("Get-Report-Details", id);
  console.log(report);
  if (report) {
    reportViewer.value = {
      shown: true,
      reportData: null,
      layout: null,
    };

    const gradientColors = await getGradientColors();
    reportViewer.value = {
      shown: true,
      reportData: report,
      layout: {
        layout: report.metadata.hasAnki ? LAYOUT_FULL : LAYOUT_ANKILESS,
        gradient: gradientColors,
      }
    };
  }
}

async function saveReportToFile() {
  const result = await exportableReportRef.value?.exportImage(false);
  if (result?.success) {
    toast.add({
      severity: "success",
      summary: "Report Saved",
      detail: `Saved to ${result.path}`,
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Save Failed",
      detail: result?.error || "Unknown error occurred",
      life: 5000,
    });
  }
}

const toast = useToast();
async function copyReport(id: string) {
  const result = await exportableReportRef.value?.exportImage(true);
  if (result?.success) {
    toast.add({
      severity: "success",
      summary: "Report copied!",
      detail: `Report #${id} was copied to your clipboard.`,
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed to copy report!",
      detail: "We were unable to copy the report to your clipboard.",
      life: 5000,
    });
  }
};

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
    v-model:visible="reportViewer.shown"
    modal
    :dismissableMask="true"
    :draggable="false"
    :style="{ width: 'fit-content', maxWidth: '90vw' }"
    :header="reportViewer.reportData?.reportNo == undefined ? 'Loading Report...' : `Report # ${reportViewer.reportData?.reportNo}`"
  >
    <div v-if="reportViewer.reportData && reportViewer.layout" class="flex gap-6">
      <div class="flex flex-col">
        <ExportableReport
          ref="exportableReportRef"
          :reportData="reportViewer.reportData"
          :layout="reportViewer.layout"
          :reportScale="0.25"
          :BASE_W="1586"
          :BASE_H="reportViewer.reportData.metadata.hasAnki ? 1800 : 1381"
        />
      </div>
      
      <!-- Right Column: Info and Actions -->
      <div class="flex flex-col gap-4" style="min-width: 280px; max-width: 320px;">
        <!-- Report Information -->
        <div class="flex flex-col gap-3">
          <h3 class="text-lg font-semibold border-b pb-2">Details</h3>
          
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-surface-600 dark:text-surface-400">Report Number:</span>
              <span class="font-medium">#{{ reportViewer.reportData.reportNo }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-surface-600 dark:text-surface-400">Total Score:</span>
              <div class="flex items-center gap-1">
                <img :src="score" class="w-4 h-4" />
                <span class="font-medium">{{ nf(reportViewer.reportData.TotalScore) }}</span>
              </div>
            </div>
            
            <div class="flex justify-between items-center" v-if="reportViewer.reportData.metadata.hasAnki">
              <span class="text-sm text-surface-600 dark:text-surface-400">Anki Reviews:</span>
              <span class="font-medium">{{ nf(reportViewer.reportData.totalReviews.current) }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-surface-600 dark:text-surface-400">Immersion Time:</span>
              <span class="font-medium">{{ Math.floor(reportViewer.reportData.ImmersionTime.current / 3600) }}h {{ Math.floor(reportViewer.reportData.ImmersionTime.current / 60) % 60}}m</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex flex-col gap-2 mt-auto">
          <h3 class="text-lg font-semibold border-b pb-2">Actions</h3>
          
          <Button
            label="Save to File"
            icon="pi pi-download"
            @click="saveReportToFile"
            class="w-full"
            severity="primary"
          />
          
          <Button
            label="Copy to Clipboard"
            icon="pi pi-clipboard"
            @click="copyReport(reportViewer.reportData.reportNo.toString())"
            class="w-full"
            outlined
          />
        </div>
      </div>
    </div>
    
    
    <!-- Loading State -->
    <div v-else class="flex items-center justify-center p-8">
      <ProgressSpinner />
    </div>
  </Dialog>

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
            class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[var(--primary-color)] to-[var(--primary-color)]"
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
              <div class="flex flex-col min-h-[600px]">
                <AnimatePresence>
                  <template
                    v-for="(item, index) in slotProps.items as ListReport[]"
                    :key="index + first"
                  >
                    <motion.div
                      v-if="item != undefined"
                      :initial="{ x: 50, opacity: 0, filter: 'blur(10px)' }"
                      :animate="{ x: 0, opacity: 1, filter: 'blur(0px)' }"
                      :transition="{
                        delay: index * 0.1,
                      }"
                      :exit="{ opacity: 0, transition: { duration: 0 } }"
                    >
                      <div class="py-2 flex">
                        <div
                          class="w-full flex flex-col sm:flex-row sm:items-center gap-4 dark:bg-black bg-[#eeeeef] overflow-hidden rounded-md pr-5"
                        >
                          <div class=" py-4 w-3 h-full bg-[var(--primary-color)]"></div>

                          <div
                            class="flex py-3 flex-col md:flex-row justify-between md:items-center flex-1 gap-6"
                          >
                            <div
                              class="flex flex-row md:flex-col justify-between items-start"
                            >
                              <div class="flex items-center gap-2">
                                <div class="text-lg font-medium">
                                  Report #{{ item.id }}
                                </div>

                                <span
                                  class="font-medium text-surface-500 dark:text-surface-400 text-sm text-[var(--primary-color)] italic"
                                >
                                  <span v-if="item.date.isSame(dayjs(), 'd')">
                                    Today
                                  </span>
                                  <span
                                    v-else-if="item.date.isSame(dayjs().subtract(1, 'day'), 'day')"
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
                                      nf(item.score.totalScore) + " " + pluralize("pt")
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
                                  v-on:click="openReport(item.id)"
                                  icon="pi pi-eye"
                                  label="View"
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
                  </template>
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
