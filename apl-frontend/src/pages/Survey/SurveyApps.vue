<script setup lang="ts">
import Listbox from "primevue/listbox";
import Logo from "../../assets/Logo.png";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import { useWindowSize } from "@vueuse/core";

import jpdb from "../../assets/AppLogos/JPDB-logo.png";
import refold from "../../assets/AppLogos/Refold-logo.png";
import clockify from "../../assets/AppLogos/Clockify-logo.png";
import mokuro from "../../assets/AppLogos/Mokuro-logo.png";
import ttsu from "../../assets/AppLogos/Ttsu-logo.png";
import { motion } from 'motion-v';

const selectedApps = defineModel<{ label: string; value: any }[] | undefined>(
  "language",
);
const { width, height } = useWindowSize();

const appList = [
  { label: "JPDB", value: "jpdb", image: jpdb },
  { label: "The Refold App", value: "refold", image: refold },
  { label: "Clockify", value: "clockify", image: clockify },
  { label: "Mokuro", value: "mokuro", image: mokuro },
  { label: "Ttsu Reader", value: "ttsu", image: ttsu },
];

onMounted(() => {
  selectedApps.value = undefined;
});

const buttonLabel = computed(() => {
  if ((selectedApps.value?.length ?? 0) == 0) {
    return "I don't use any of these apps";
  }
  return "Continue";
});

const router = useRouter();
function NextPage() {
  const sanitizedData = JSON.parse(JSON.stringify(selectedApps.value)).map(
    (x: any) => x.value,
  );
  window.ipcRenderer
    .invoke("answer-survey-apps", sanitizedData)
    .then((res: any) => {
      router.push("/setup/complete");
    });
}
</script>

<template>
  <SetupBackground/>

  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between h-screen w-full max-w-[60rem] bg-black"
    >
      <div class="flex w-full items-center justify-between mb-6">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20"/>
        <AccountDisplay/>
      </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{ duration: 0.6 } }"
        class="flex flex-col flex-1 space-y-6"
      >
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          Tell us about the tools you use.
        </h1>

        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          Select any of the following tools you use to learn your target language.
          We use this to decide which apps to support next. You can pick as many as you like.
        </p>

        <Listbox
          v-model="selectedApps"
          :options="appList"
          multiple
          :scroll-height="height > 800 ? '700px' : height / 2 + 'px'"
          class="w-full p-2 bg-[#18181B] rounded-lg"
        >
          <template #option="{ option }">
            <div
              class="flex items-center w-full p-3 hover:bg-zinc-800 cursor-pointer rounded"
            >
              <img :src="option.image" class="w-12 h-12 mr-5" alt="" />
              <div class="font-semibold text-white">{{ option.label }}</div>
            </div>
          </template>
        </Listbox>
      </motion.div>
      <div class="flex justify-end">
        <Button
          :label="buttonLabel"
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full"
        />
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
