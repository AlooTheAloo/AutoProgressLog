<script setup lang="ts">
import { Layout, ReportData } from "../../pages/Report/src/types/report-data";
import { onMounted, ref } from "vue";
import Report from "../../pages/Report/src/components/Report.vue";
import domToImage from "dom-to-image";
import { Options } from "../../../apl-backend/types/options";

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

async function exportImage() {
  console.log("Exporting image...");
  if (!host.value) {
    console.error("Host element not found");
    return;
  }

  try {
    const cfg: Options = await window.ipcRenderer.invoke("GetConfig");
    console.log("Config retrieved:", cfg);

    const outOpts = cfg.localOptions.outputOptions;

    const params = {
      width: BASE_W,
      height: BASE_H,
      style: {
        transformOrigin: "top left",
        transform: `scale(${1 / props.reportScale})`,
      },
      quality: outOpts.outputQuality,
    };

    let promise;

    const e = outOpts.outputFile.extension;

    if (e == ".jpeg" || e == ".jpg") {
      promise = domToImage.toJpeg(host.value, params);
    } else if (e == ".png") {
      promise = domToImage.toPng(host.value, params);
    } else {
      alert("Invalid extension");
      return;
    }

    return promise.then((x) => {
      console.log("Image generated, sending to backend...");
      return window.ipcRenderer.invoke("Export-Image", x, props.reportData.reportNo);
    }).catch((err) => {
      console.error("Error generating image:", err);
      return { success: false, error: err };
    });
  } catch (error) {
    console.error("Error in exportImage:", error);
    return { success: false, error: error };
  }
}

defineExpose({
  exportImage,
});
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

  <!-- <Button @click="exportImage"> export that shit </Button> -->
</template>
