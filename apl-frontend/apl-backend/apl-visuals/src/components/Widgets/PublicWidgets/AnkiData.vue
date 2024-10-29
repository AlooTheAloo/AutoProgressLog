<script lang="ts" setup>
import { ReportData } from '../../../types/report-data';
import RetentionRate from '../RetentionRate.vue';
import TotalReviews from '../TotalReviews.vue';

    interface AnkiDataProps{
        reportData:ReportData
    }

    defineProps<AnkiDataProps>();

</script>
<template>
    <div class=" flex gap-5">
        <RetentionRate :retention="reportData.retentionRate"/>
        <TotalReviews :reviews="reportData.totalReviews"/>
    </div>
</template>