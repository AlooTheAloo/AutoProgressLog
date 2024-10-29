<script setup lang="ts">
  import { Layout, ReportData } from '../types/report-data';
  import { Ref, ref } from 'vue';
  import reportdataurl from "/report-data.json?url"
  import layouturl from "/report-layout.json?url"
  import Stats from './Stats.vue';

  const reportdatareq = await fetch(reportdataurl)
  const json = await reportdatareq.json();
  let reportdata:Ref<ReportData> = ref(json);

  const layoutreq = await fetch(layouturl)
  const layout = await layoutreq.json();
  const layoutdata:Ref<Layout> = ref(layout);  
</script>



<template>
    <div>
      <div 
      :style="
      {
        'background-image': `linear-gradient(to bottom right, ${layoutdata.gradient})`
      }
      "
      class="w-[1586px] h-[1718px] pt-[54px] pl-[52px] ">
        <div :style="{
          boxShadow: '0px 24px 4rem rgba(0, 0, 0, 0.5)'
        }"
         class=" text-white w-[1476px] h-fit bg-[#23222B] rounded-xl flex flex-col">
          <div class="w-full h-20 flex px-8 items-center gap-3">
            <div class="h-5 w-5 bg-[#FF5F56] rounded-full"/>
            <div class="h-5 w-5 bg-[#FFBD2D] rounded-full"/>
            <div class="h-5 w-5 bg-[#26C940] rounded-full"/>
          </div>
          <div class=" px-[118px] w-full flex-grow flex flex-col">
            <h1 class=" bg-gradient-to-t from-[#23222B] to-white pb-5 text-transparent bg-clip-text">
              <p class=" text-7xl font-bold ">
                Progress Report #{{ reportdata.reportNo }}
              </p>
            </h1>
            <h2 class=" text-[#8E8E8E] text-lg -mt-4 mb-10">
              {{ reportdata.time }}
            </h2>
            <Stats v-bind:reportData="reportdata" v-bind:layout="layoutdata.layout"/>
            <div class="flex justify-center items-center h-full text-[#727272] py-5">
              www.aplapp.dev • Made with ♥ by AlooTheAloo and Retexc 
            </div>
          </div>
        </div> 
      </div>
    </div>

  
</template>


