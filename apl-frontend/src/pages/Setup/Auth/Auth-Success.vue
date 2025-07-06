<script setup lang="ts">
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import Button from "primevue/button";
import Logo from "../../../assets/Logo.png";
import { motion } from "motion-v";
import { useRouter } from "vue-router";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";

const router = useRouter();

function NextPage() {
  router.push("/setup/client-server-selection");
}
</script>

<template>
  <SetupBackground />
  <div
    :style="{ backgroundImage: `linear-gradient(to bottom right, #add8ff, #d8b4fe)` }"
    class="relative flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />  
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
      <div class="space-y-6 w-full">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20" />
        <BackButton route="/setup/index" />
        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 1 },
          }"
          class="flex flex-col items-start space-y-4 w-full"
        >
          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Account successfully created!
          </h1>
        </motion.div>
      </div>
      <div class="w-full flex justify-end">
        <Button
          @click="NextPage"
          class="w-[300px] p-3 rounded-full flex items-center justify-center transition-all duration-200 font-bold"
        >
          Awesome !
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
