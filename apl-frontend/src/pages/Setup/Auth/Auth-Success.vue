<script setup lang="ts">
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import Button from "primevue/button";
import Logo from "../../../assets/Logo.png";
import { motion } from "motion-v";
import { useRouter } from "vue-router";

const router = useRouter();

function NextPage() {
  router.push("/setup/client-server-selection");
}
</script>

<template>
  <SetupBackground />
  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between w-full max-w-[60rem] bg-black min-h-screen"
    >
      <div class="space-y-6">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20" />
        <BackButton route="/setup/index" />
        <motion.div class="flex">
          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Account successfully created!
          </h1>
        </motion.div>
      </div>
      <div class="flex justify-end">
        <Button
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full flex items-center justify-center transition-all duration-200 font-bold"
        >
          Awesome !
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
