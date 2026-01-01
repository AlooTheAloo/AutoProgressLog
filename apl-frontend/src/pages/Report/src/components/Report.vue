<script setup lang="ts">
import { Layout, ReportData } from "../types/report-data";
import { onMounted, ref } from "vue";

import Stats from "./Stats.vue";
import dayjs from "dayjs";

const reportdata = ref<ReportData | null>(null);
const layoutdata = ref<Layout | null>(null);

const props = defineProps<{
  reportData: ReportData;
  layout: Layout;
  BASE_W: number;
  BASE_H: number;
}>();

onMounted(() => {
  reportdata.value = props.reportData;
  layoutdata.value = props.layout;
});
</script>

<template>
  <div v-if="reportdata != null && layoutdata != null">
    <div
      :style="{
        'background-image': `linear-gradient(to bottom right, ${layoutdata.gradient})`,
        'width' : props.BASE_W + 'px',
        'height' : props.BASE_H + 'px'
      }"
      class="w-[1586px] h-[1800px] pt-[54px] pl-[52px]"
    >
      <div
        :style="{
          boxShadow: '0px 24px 4rem rgba(0, 0, 0, 0.5)',
        }"
        class="text-white w-[1476px] h-fit bg-[#23222B] rounded-xl flex flex-col"
      >
        <div class="w-full h-20 flex px-8 items-center gap-3">
          <div class="h-5 w-5 bg-[#FF5F56] rounded-full" />
          <div class="h-5 w-5 bg-[#FFBD2D] rounded-full" />
          <div class="h-5 w-5 bg-[#26C940] rounded-full" />
        </div>
        <div class="px-[118px] w-full flex-grow flex flex-col">
          <h1
            class="bg-gradient-to-t from-[#23222B] to-white pb-5 text-transparent bg-clip-text"
          >
            <p class="text-7xl font-bold">
              Progress Report #{{ reportdata.reportNo }}
            </p>
          </h1>
          <h2 class="text-[#8E8E8E] text-lg -mt-4 mb-10">
            {{ dayjs(reportdata.time).format("LLLL") }}
          </h2>

          <Stats
            v-bind:reportData="reportdata"
            v-bind:layout="layoutdata.layout"
          />
          <div
            class="flex justify-center items-center h-full text-[#727272] py-5"
          >
            www.aplapp.dev • Made with ♥ by the APL team
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
