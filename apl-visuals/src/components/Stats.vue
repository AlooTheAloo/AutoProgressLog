<script setup lang="ts">
  import TotalReviews from "./Widgets/TotalReviews.vue"
  import RetentionRate from "./Widgets/RetentionRate.vue"
  import { ReportData } from "../types/report-data";
  import Mature from "./Widgets/Mature.vue";
  import TimeMap from "./Widgets/TimeMap.vue";
  import TotalTime from "./Widgets/TotalTime.vue";
  import AverageTime from "./Widgets/AverageTime.vue";
  import ImmersionLog from "./Widgets/ImmersionLog.vue";
  import TotalScore from "./Widgets/TotalScore.vue";

  interface StatsProps {
    reportData:ReportData
  }

  defineProps<StatsProps>();
</script>

<template>
  <div class="flex flex-col h-full w-full flex-grow gap-12 ">
    <div class="w-full flex gap-8 ">
      <div class="w-0 h-full flex flex-col flex-grow">
        <div>
          <Mature :data="reportData.matureCards" ></Mature>
        </div>
        <div class=" flex gap-5 my-5 ">
          <RetentionRate :retention="reportData.retentionRate"></RetentionRate>
          <TotalReviews :reviews="reportData.totalReviews"></TotalReviews>
        </div>
        <div class="flex-grow ">
          <TimeMap :streak="reportData.AnkiStreak" :data="reportData.AnkiData" ></TimeMap>
        </div>
      </div>
      <div class="w-0 h-full flex flex-col flex-grow">
        <div class=" flex gap-5">
          <TotalTime :time="reportData.ImmersionTime"></TotalTime>
          <AverageTime :time="reportData.AverageImmersionTime"></AverageTime>
        </div>
        <div class="my-5">
          <ImmersionLog :log="reportData.ImmersionLog" ></ImmersionLog>
        </div>
        
        <div class="flex-grow ">
          <TimeMap :streak="reportData.AnkiStreak" :data="reportData.AnkiData" ></TimeMap>
        </div>
      </div>
    </div>
    <div class="w-full ">
      <TotalScore :data="reportData"></TotalScore>
    </div>
  </div> 
  <!-- 

  </Mature>
  <div class="flex justify-between">
   
    <TotalTime :time="reportData.ImmersionTime"></TotalTime>
    <BestTime :time="reportData.BestImmersionTime"></BestTime>
    
  </div>
  

  <!-- <div class="w-full h-full ">
    <div class=" ml-12 w-full h-full">
        <RadialProgress
        :class="' z-10 -rotate-[135deg] '"
        :inner-stroke-color="'#00000000'"
        :start-color="'#0000FF'"
        :stopColor="'#FF0000'"
        :diameter="200"
        :stroke-width="20"
        :inner-stroke-width="15"
        :completed-steps="2"
        :animate-speed="0"
        :total-steps="5"
        ></RadialProgress>

        <RadialProgress
        :class="'-mt-[200px] filter blur-md opacity-50 -rotate-[135deg]'"
        :inner-stroke-color="'#00000000'"
        :start-color="'#0000FF'"
        :stopColor="'#FF0000'"
        :diameter="200"
        :stroke-width="20"
        :inner-stroke-width="15"
        :completed-steps="2"
        :animate-speed="0"
        :total-steps="5"
        ></RadialProgress>
    </div>
  </div> -->
</template>