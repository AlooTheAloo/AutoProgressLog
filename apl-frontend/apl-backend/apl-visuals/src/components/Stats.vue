<script setup lang="ts">
  import { ReportData } from "../types/report-data";
  import TotalScore from "./Widgets/TotalScore.vue";
  import ImmersionData from "./Widgets/PublicWidgets/ImmersionData.vue";
  import AnkiData from "./Widgets/PublicWidgets/AnkiData.vue";
  import AnkiStreak from "./Widgets/PublicWidgets/AnkiStreak.vue";
  import ImmersionStreak from "./Widgets/PublicWidgets/ImmersionStreak.vue";
  import pImmersionLog from "./Widgets/PublicWidgets/pImmersionLog.vue";
  import pMature from "./Widgets/PublicWidgets/pMature.vue";

  interface StatsProps {
    reportData:ReportData
  }

  defineProps<StatsProps>();
</script>

<template>
  <div class="flex flex-col h-full w-full flex-grow gap-12 ">
    <div class="w-full flex gap-8 ">
      <div class="w-0 h-full flex flex-col flex-grow gap-5">
        <pMature :reportData="reportData" />
        <AnkiData :reportData="reportData"/>
        <AnkiStreak :reportData="reportData"/>
      </div>
      <div class="w-0 h-full flex flex-col flex-grow gap-5">
        <ImmersionData :reportData="reportData"/>
        <pImmersionLog :reportData="reportData"/>
        <ImmersionStreak :reportData="reportData"/>
      </div>
    </div>
    <div class="w-full">
      <TotalScore :data="reportData"></TotalScore>
    </div>
    
  </div> 
</template>