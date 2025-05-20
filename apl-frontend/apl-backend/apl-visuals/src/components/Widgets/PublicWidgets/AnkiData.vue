<script lang="ts" setup>
import { ReportData } from "../../../types/report-data";
import RetentionRate from "../RetentionRate.vue";
import TotalReviews from "../TotalReviews.vue";

interface AnkiDataProps {
  reportData: ReportData;
}

const props = defineProps<AnkiDataProps>();
</script>
<template>
  <div class="flex gap-5">
    <RetentionRate :retention="props.reportData.retentionRate" />
    <TotalReviews :reviews="props.reportData.totalReviews" />
  </div>
</template>
