<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import { onMounted, ref, useModel, watch } from "vue";
import Logo from "../../../assets/Logo.png";
import { useWindowSize } from "@vueuse/core";
const router = useRouter();
import DatePicker from "primevue/datepicker";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
import dayjs from "dayjs";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import { motion } from "motion-v";

const selectedTime = defineModel<Date>("time");

onMounted(() => {
  selectedTime.value = dayjs().startOf("day").toDate();
});

const { width, height } = useWindowSize();

function Confirm() {
  const dayjsTime = dayjs(selectedTime.value);
  window.ipcRenderer
    .invoke("set-server-options", {
      generationTime: {
        hours: dayjsTime.hour(),
        minutes: dayjsTime.minute(),
      },
    })
    .then(() => {
      router.push("/setup/toggl-manual-connect");
    });
}
</script>

<template>
  <SetupBackground />
  <div
    :style="{
      'background-image': `linear-gradient(to bottom right, #add8ff, #d8b4fe)`,
    }"
    class="flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />
    <div
      class="relative z-10 bg-black rounded-3xl p-12 flex flex-col justify-between items-start h-[90vh] max-h-[946px] w-full max-w-[899px] min-w-[600px]"
    >
      <div class="flex flex-col items-start space-y-6 w-full">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20" />
        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6 },
          }"
          class="flex flex-col items-start space-y-6"
        >
          <BackButton route="/setup/index" />
          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            At what time will the reports be generated ?
          </h1>
          <div
            class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
          >
            Reports will be generated automatically at a predetermined time. If
            your computer is turned off or disconnected from the internet, the
            reports will not be generated. You can change this in the settings
            later.
          </div>
          <div class="flex flex-col gap-2 w-full">
            <p class="text-lg font-semibold">Generate at :</p>
            <DatePicker
              hour-format="12"
              class="h-12"
              id="datepicker-timeonly"
              v-model="selectedTime"
              timeOnly
            />
          </div>
        </motion.div>
      </div>
      <div class="w-full flex justify-end">
        <Button @click="Confirm" class="w-[300px] p-3 rounded-full">
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
