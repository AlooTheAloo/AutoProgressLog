
<script setup lang="ts">
    import Retention from "/Icons/Retention.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    import { roundTo } from 'round-to';
    interface RetentionRateProps{
        retention: TPlusDelta<number>;
    }
    const props = defineProps<RetentionRateProps>();
</script>

<template>
    <SmallWidget title="Retention Rate" units="%" :image="Retention" :value="{ 
        current:roundTo(props.retention.current, 2),
        delta:roundTo(props.retention.delta, 2)
      }"></SmallWidget>
</template>