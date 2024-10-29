<script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
import Mature from '../Mature.vue';
    interface ImmersionDataProps{
        reportData:ReportData
    }
    defineProps<ImmersionDataProps>();

</script>
<template>
    <div class="flex-grow ">
        <Mature :data="reportData.matureCards" />
    </div>
</template>