<script setup lang="ts">
import { Layout, ReportData } from "../../pages/Report/src/types/report-data";
import { onMounted, ref } from "vue";
import Report from "../Report/src/components/Report.vue";
import domToImage from "dom-to-image";

const reportdata = ref<ReportData | null>(null);
const layoutdata = ref<Layout | null>(null);

// TODO : no they're not
const BASE_W = 1586;
const BASE_H = 1800;

const host = ref<HTMLElement | null>(null);

const props = defineProps<{
  reportData: ReportData;
  layout: Layout;
  reportScale: number;
}>();

function exportImage() {
  if (!host.value) return;

  domToImage
    .toPng(host.value, {
      width: BASE_W,
      height: BASE_H,
      style: {
        transformOrigin: "top left",
        transform: `scale(${1 / props.reportScale})`,
      },
      quality: 1,
    })
    .then((x) => {
      window.ipcRenderer.invoke("Export-Image", x);
    });
}
</script>

<template>
  <div class="bg-orange-700" ref="host">
    <div
      :style="{
        width: `${BASE_W * reportScale}px`,
        height: `${BASE_H * reportScale}px`,
        transform: `scale(${reportScale})`,
        transformOrigin: 'top left',
      }"
      class="flex justify-start items-start"
    >
      <Report :reportData="reportData" :layout="layout" />
    </div>
  </div>

  <Button @click="exportImage"> export that shit </Button>
</template>
