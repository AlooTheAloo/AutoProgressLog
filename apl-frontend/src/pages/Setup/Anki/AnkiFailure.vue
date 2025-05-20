<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import AnkiLogo from "../../../assets/AnkiLogo.png";
import { ref } from "vue";
import { motion } from 'motion-v'
const router = useRouter();

function NextPage() {
  router.push("/setup/anki-home");
}
</script>

<template>
  <SetupBackground/>

  <div class="flex w-screen">
    <div class="p-4 sm:p-12 flex flex-col h-screen w-full max-w-[60rem] bg-black">
      <div class="space-y-6">
        <div class="flex w-full items-center justify-between">
          <img :src="Logo" class="w-16 h-16 sm:w-20 sm:h-20" />
          <AccountDisplay/>
        </div>
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          The connection failed.
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0]">
          You may have provided an incorrect password or username. Please try again.
        </p>
      </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{duration:0.6} }"
        class="flex flex-1 w-full justify-center items-center"
      >
      <div class="flex flex-col items-center gap-4 -mt-16">
          <div class="flex gap-4 items-center">
            <img :src="AnkiLogo" class="w-12" />
            <i class="pi pi-times-circle text-red-300" style="font-size:2rem"/>
            <img :src="Logo" class="w-14" />
          </div>
          <div class="text-2xl font-semibold text-white text-center">
            Failed to connect to Anki
          </div>
        </div>
      </motion.div>

      <div class="flex justify-end">
        <Button
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full"
        >
          <span class="text-xl font-bold text-black">Try again</span>
        </Button>
      </div>

    </div>
    <div class="flex-grow"></div>
  </div>
</template>
