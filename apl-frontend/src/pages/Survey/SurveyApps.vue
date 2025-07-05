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
import PlexusEffect from "../../components/Common/PlexusEffect.vue";
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
  <div
    :style="{ backgroundImage: `linear-gradient(to bottom right, #add8ff, #d8b4fe)` }"
    class="relative flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />

    <!-- Card -->
    <div
      class="
        relative z-10
        bg-black rounded-3xl p-12

        /* 1) column flex that spans full height */
        flex flex-col justify-between items-start
        h-[90vh] max-h-[946px]  /* your height rules */

        /* 2) width clamped between min & max */
        w-full max-w-[899px] min-w-[600px]
      "
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
          :scroll-height="height > 800 ? '400px' : height / 2 + 'px'"
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
      <div class="w-full flex justify-end">
        <Button
          :label="buttonLabel"
          @click="NextPage"
          class="w-[300px] p-3 rounded-full"
        />
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
