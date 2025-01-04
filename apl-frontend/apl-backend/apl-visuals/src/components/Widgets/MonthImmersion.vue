
<script setup lang="ts">

    import Calendar from "/Icons/Calendar.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    interface MonthTimeProps{
        time: TPlusDelta<number>;
    }
    defineProps<MonthTimeProps>();
    

</script>

<template>
    <SmallWidget title="Immersion this month" units="hours" :image="Calendar" :value="{ 
        current:time.current,
        delta:time.delta
      }"></SmallWidget>
</template>