<script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
    import ImmersionLog from '../ImmersionLog.vue';
    interface ImmersionDataProps{
        reportData:ReportData
    }
    defineProps<ImmersionDataProps>();

</script>
<template>
    <div class="">
        <ImmersionLog :log="reportData.ImmersionLog"/>
    </div>
</template>