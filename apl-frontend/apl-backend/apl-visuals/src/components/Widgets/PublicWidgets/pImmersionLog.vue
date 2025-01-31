<script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
    import ImmersionLog from '../ImmersionLog.vue';
    interface ImmersionDataProps{
        reportData:ReportData
    }
    const props = defineProps<ImmersionDataProps>();

</script>
<template>
    <div class="">
        <ImmersionLog :log="props.reportData.ImmersionLog"/>
    </div>
</template>