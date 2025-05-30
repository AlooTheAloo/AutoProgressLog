<script setup lang="ts">
import dayjs from "dayjs";
import formatTime from "../../util/timeFormat";
import Time from "../../assets/Icons/time.png";
import Eye from "../../assets/Icons/eye.png";
import Brain from "../../assets/Icons/brain.png";
import Calendar from "../../assets/Icons/calendar.png";

import AppSmallWidget from "./AppSmallWidget.vue";
import { computed } from "vue";
import pluralize from "pluralize";
import ImmersionSources from "./ImmersionSources.vue";
import Skeleton from "primevue/skeleton";
import { useWindowSize } from "@vueuse/core";
import { DashboardDTO } from "../../../electron/main/Electron-Backend/types/Dashboard";
import ImmersionStreak from "./ImmersionStreak.vue";
import { motion } from "motion-v";

const props = defineProps<{
  dto: DashboardDTO;
  syncing: boolean;
}>();

const { width, height } = useWindowSize();

const bottomText = computed(() => {
  const dto = props.dto.immersionDTO;
  // Diff as percentage
  let difference = dto.monthlyImmersion - dto.monthlyImmersionLastMonth;

  // No text to display if difference is 0
  if (difference == 0) return ``;

  // Round
  difference =
    Math.round(dayjs.duration(difference, "s").asHours() * 100) / 100;

  // Choose direction
  const direction = difference > 0;

  if (Math.abs(difference) < 1 / 60) return "";

  // Build html
  return `
    <div style=\"color: ${
      direction ? "#11C76F" : "#FE7D7D"
    }; font-size:small; \"> 
        <b> ${
          Math.abs(difference) >= 1
            ? pluralize("hour", Math.abs(difference), true)
            : pluralize("minute", Math.ceil(Math.abs(difference * 60)), true)
        } ${direction ? "more" : "less"} </b> 
        than last month at this time
    </div>`;
});
</script>
<template>
  <div v-if="syncing" class="flex flex-col flex-grow items-center">
    <!-- Main Container -->
    <div class="flex flex-col justify-center gap-3 h-fit w-fit items-center">
      <!-- First Row -->
      <div class="flex gap-3 justify-center flex-col 1720:flex-row">
        <!-- Small Widgets Row -->
        <div class="flex flex-row gap-3 w-[45rem]">
          <Skeleton width="50%" height="9rem" />
          <Skeleton width="50%" height="9rem" />
        </div>
        <!-- Second Row -->
        <div class="flex flex-row gap-3 w-[45rem]">
          <Skeleton width="50%" height="9rem" />
          <Skeleton width="50%" height="9rem" />
        </div>
      </div>
      <!-- Immersion Sources Section -->
      <div class="flex-grow flex justify-start w-[45rem] 1720:w-full gap-3">
        <Skeleton :height="'24rem'" />
        <Skeleton :height="'24rem'" />
      </div>
    </div>
  </div>

  <div v-else class="flex flex-col flex-grow items-center">
    <div class="flex-col justify-center gap-10 flex h-fit w-fit items-center">
      <div class="flex 1720:flex-row flex-col gap-3 justify-center">
        <div class="flex flex-row gap-3 w-[45rem]">
          <AppSmallWidget
            title="Immersion time this month"
            units="hours"
            :condense="true"
            :value="{
              current: dayjs
                .duration(dto.immersionDTO.monthlyImmersion, 's')
                .asHours(),
              delta: formatTime(dto.immersionDTO.monthlyImmersionLastMonth),
            }"
            :image="Calendar"
            :direction="0"
            :hideDelta="true"
            :bottomText="bottomText"
            :index="0"
          />

          <AppSmallWidget
            title="Total Immersion Time"
            units="hours"
            :condense="true"
            :value="{
              current: dayjs
                .duration(dto.immersionDTO.totalImmersion, 's')
                .asHours(),
              delta: formatTime(dto.immersionDTO.immersionSinceLastReport),
            }"
            :image="Time"
            :direction="dto.immersionDTO.immersionSinceLastReport"
            :hideDelta="dto.immersionDTO.immersionSinceLastReport === 0"
            :index="1"
          />
        </div>
        <div class="w-[45rem]">
          <div v-if="dto.ankiDTO != null" class="flex flex-row gap-3">
            <AppSmallWidget
              v-if="dto.ankiDTO != null"
              title="Retention rate"
              units="%"
              :value="{
                current: dto.ankiDTO.retentionRate.toFixed(2),
                delta: dto.ankiDTO.retentionRateDelta.toString(),
              }"
              :image="Brain"
              :direction="dto.ankiDTO.retentionRateDelta"
              :hideDelta="dto.ankiDTO.retentionRateDelta === 0"
              :index="2"
            />

            <AppSmallWidget
              v-if="dto.ankiDTO != null"
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
              :index="3"
            />
          </div>
          <div v-else>
            <div class="hidden 1720:flex">
              <motion.div
                :initial="{
                  opacity: 0,
                  y: 20,
                  filter: 'blur(10px)',
                }"
                :while-in-view="{
                  y: 0,
                  opacity: 1,
                  filter: 'blur(0px)',
                }"
                :transition="{
                  delay: 0.1,
                }"
                class="flex flex-col flex-grow h-36 bg-black rounded-xl items-center justify-center text-white text-center"
              >
                <div class="font-semibold text-2xl">Want more data?</div>
                <div class="">
                  Enable anki integration in the settings page to see your
                  statistics.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        :initial="{
          opacity: 0,
          y: 20,
          filter: 'blur(10px)',
        }"
        :while-in-view="{
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          delay: 0.1,
        }"
        class="flex-grow flex justify-start w-[45rem] h-[25rem] 1720:w-full gap-3"
      >
        <ImmersionSources :sources="dto.immersionDTO.immersionSources" />
        <ImmersionStreak :streak="dto.immersionDTO.immersionStreak" />
      </motion.div>
    </div>
  </div>
</template>
