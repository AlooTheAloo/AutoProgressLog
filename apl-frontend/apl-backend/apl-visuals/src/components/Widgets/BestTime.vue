
<script setup lang="ts">

    import Calendar from "/Icons/BestTime.png"
    import SmallWidget from "../SmallWidget.vue"
    import { TPlusDelta } from "../../types/report-data";
    import dayjs from "dayjs";
    
    interface BestTimeProps{
        time: TPlusDelta<number>;
    }
    const props = defineProps<BestTimeProps>();
    

</script>

<template>
    <SmallWidget title="Best Immersion Time" units="" :image="Calendar" :value="{ 
        current: dayjs.duration(Math.abs(time.current), 'second').format('HH:mm:ss'),
        delta: 0
      }"
      :hide-delta="true"
      :new-best="props.time.delta != 0"
      ></SmallWidget>
</template>