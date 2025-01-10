
<script setup lang="ts">

    import Calendar from "/Icons/Calendar.png"
    import SmallWidget from "../SmallWidget.vue"
    interface MonthTimeProps{
        time: number;
    }
    defineProps<MonthTimeProps>();
    

</script>

<template>
    <SmallWidget title="Immersion this month" units="hours" :image="Calendar" :value="{ 
        current: (time / 3600).toFixed(2),
        delta:0 
      }"
      :hide-delta="true"
      ></SmallWidget>
</template>