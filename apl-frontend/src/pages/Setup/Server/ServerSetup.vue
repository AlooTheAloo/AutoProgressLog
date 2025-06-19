<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import { onMounted, ref, useModel, watch } from "vue";
import Logo from "../../../assets/Logo.png";
import { useWindowSize } from "@vueuse/core";
const router = useRouter();
import DatePicker from "primevue/datepicker";
import dayjs from "dayjs";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";

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
  <SetupBackground></SetupBackground>
<div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between
             w-full max-w-[60rem] bg-black min-h-screen"
    >
      <div class="space-y-6">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20"/>
        <BackButton route="/setup/index"/>
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          At what time will the reports be generated ?
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0]">
          Reports will be generated automatically at a predetermined time. If
          your computer is turned off or disconnected from the internet, the
          reports will not be generated. You can change this in the settings
          later.
        </p>
        <div class="flex flex-col gap-1 w-full">
          <p class="text-lg font-semibold">Generate at :</p>
              <DatePicker
                hour-format="12"
                class="h-12"
                id="datepicker-timeonly"
                v-model="selectedTime"
                timeOnly
              />
        </div>
      </div>
        <div class="flex justify-end">
          <Button
          @click="Confirm"
          class="w-[300px] p-3 !rounded-full"
        >
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>  

  <!-- <SetupBackground/>

        <div class=" flex w-screen">
            <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
                <div v-if="height > 650">
                    <img :src="Logo" class=" w-12 h-12">
                </div>
                <div class="flex flex-col flex-grow justify-between gap-2 text-left py-10 ">
                    <div>
                        <BackButton route="/setup/client-server-selection"/>
                        <div class="font-semibold text-4xl text-white">
                            At what time and how often will the reports be generated ?
                        </div>
                        <div class="text-gray-600 font-light mb-5 text-xs lg:text-sm">
                            Reports will be generated automatically at a predetermined time. If your computer is turned off or disconnected from the internet, the reports will not be generated.
                            You can change this in the settings later.
                        </div>
                        
                    </div>
                    
                    
                    
                </div>
            </div>
        </div> -->
</template>
