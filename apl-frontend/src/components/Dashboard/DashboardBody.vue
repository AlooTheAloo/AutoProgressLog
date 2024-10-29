<script setup lang="ts">
import dayjs from 'dayjs';
import formatTime from '../../util/timeFormat';
import Time from "../../assets/Icons/time.png";
import Eye from "../../assets/Icons/eye.png";
import Brain from "../../assets/Icons/brain.png";
import Calendar from "../../assets/Icons/calendar.png";

import AppSmallWidget from './AppSmallWidget.vue';
import { computed, ref } from 'vue';
import { DashboardDTO } from '../../../types/DTO';

const props = defineProps<{
    dto: DashboardDTO;
}>();


const bottomText = computed(() => {

    const dto = props.dto.immersionDTO;
    // Diff as percentage
    let difference = (dto.monthlyImmersion - dto.monthlyImmersionLastMonth);
    
    // No text to display if difference is 0
    if(difference == 0)
        return ``;


    // Round
    difference = Math.round(dayjs.duration(difference, "s").asHours() * 100) / 100;
    
    // Choose direction
    const direction = difference > 0;
    
    

    // Build html
    return `
    <div style=\"color: ${direction ? '#5FFFB2' : 'FE7D7D'}; font-size:small; \"> 
        <b> ${difference} hours ${direction ? 'more' : 'less'} </b> 
        than last month at this time
    </div>`

})



</script>
<template>
    <div class="flex-grow flex-wrap justify-center flex w-96 gap-3 ">
        <AppSmallWidget
        title="Immersion time this month"
        units="hours"
        :condense="true"
        :value="{
            current: dayjs.duration(dto.immersionDTO.monthlyImmersion, 's').asHours(),
            delta: formatTime(dto.immersionDTO.monthlyImmersionLastMonth),
        }"
        :image="Calendar"
        :direction="0"
        :hideDelta="true"
        :bottomText="bottomText"
        />
        
        <AppSmallWidget
        title="Total Immersion Time"
        units="hours"
        :condense="true"
        :value="{
            current: dayjs.duration(dto.immersionDTO.totalImmersion, 's').asHours(),
            delta: formatTime(dto.immersionDTO.immersionSinceLastReport),
        }"
        :image="Time"
        :direction="dto.immersionDTO.immersionSinceLastReport"
        :hideDelta="dto.immersionDTO.immersionSinceLastReport === 0"
        />

        <AppSmallWidget v-if="dto.ankiDTO != null"
        title="Retention rate"
        units="%"
        :condense="true"
        :value="{
            current: dto.ankiDTO.retentionRate,
            delta: dto.ankiDTO.retentionRateDelta,
        }"
        :image="Brain"
        :direction="dto.ankiDTO.retentionRateDelta"
        :hideDelta="dto.ankiDTO.retentionRateDelta === 0"
        />

        <AppSmallWidget v-if="dto.ankiDTO != null"
        title="Total Cards Reviewed"
        units="cards"
        :condense="true"
        :value="{
            current: dto.ankiDTO.totalReviews,
            delta: dto.ankiDTO.reviewsDelta,
        }"
        :image="Eye"
        :direction="dto.ankiDTO.reviewsDelta"
        :hideDelta="dto.ankiDTO.reviewsDelta === 0"
        />
    </div>
</template>w