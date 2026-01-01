<script lang="ts" setup>
import { ReportData } from "../../../types/report-data";
import Mature from "../Mature.vue";
interface ImmersionDataProps {
  reportData: ReportData;
}
const props = defineProps<ImmersionDataProps>();
</script>
<template>
  <div class="flex-grow">
    <Mature :data="props.reportData.matureCards" />
  </div>
</template>
