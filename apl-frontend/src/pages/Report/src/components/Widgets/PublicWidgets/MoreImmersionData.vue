<script lang="ts" setup>
import { ReportData } from "../../../types/report-data";
import BestTime from "../BestTime.vue";
import MonthImmersion from "../MonthImmersion.vue";

interface AnkiDataProps {
  reportData: ReportData;
}

const props = defineProps<AnkiDataProps>();
</script>
<template>
  <div class="flex gap-5">
    <MonthImmersion :time="props.reportData.MonthlyImmersion"></MonthImmersion>
    <BestTime :time="props.reportData.BestImmersion"></BestTime>
  </div>
</template>
