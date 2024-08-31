<script setup lang="ts">
import Stats from './Stats.vue';
import dayjs from 'dayjs';
import { ReportData } from '../types/report-data';
import { Ref, ref } from 'vue';
import reportdataurl from "/report-data.json?url"

  const reportdata = await fetch(reportdataurl)
  const json = await reportdata.json();
  let MY_JSON:Ref<ReportData> = ref(json);
</script>



<template>
    <div>
      <div class="w-[1586px] h-[1718px] bg-gradient-to-br from-[#FF0000] via-[#D57AFF] to-[#74B4FF] pt-[54px] pl-[52px] ">
        <div :style="{
          boxShadow: '0px 24px 4rem rgba(0, 0, 0, 0.5)'
        }"
         class=" text-white w-[1476px] h-[1613px] bg-[#23222B] rounded-xl flex flex-col">
          <div class="w-full h-20 flex px-8 items-center gap-3">
            <div class="h-5 w-5 bg-[#FF5F56] rounded-full"/>
            <div class="h-5 w-5 bg-[#FFBD2D] rounded-full"/>
            <div class="h-5 w-5 bg-[#26C940] rounded-full"/>
          </div>
          <div class=" px-[118px] w-full flex-grow flex flex-col">
            <h1 class=" bg-gradient-to-t from-[#23222B] to-white pb-5 text-transparent bg-clip-text">
              <p class=" text-7xl font-bold ">
                Progress Report #{{ MY_JSON.reportNo }}
              </p>
            </h1>
            <h2 class=" text-[#8E8E8E] text-lg -mt-4 mb-10">
              Generated on {{ dayjs(MY_JSON.time).format('DD/MM/YYYY [at] H:mm')  }}
            </h2>
            <Stats v-bind:reportData="MY_JSON"  />
            <div class="flex justify-center items-center h-full text-[#727272]">
              www.aplapp.dev • Made with ♥ by AlooTheAloo and Retexc 
            </div>
          </div>
        </div> 
      </div>
    </div>

  
</template>


