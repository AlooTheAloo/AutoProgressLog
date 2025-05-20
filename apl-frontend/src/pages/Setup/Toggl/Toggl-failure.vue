<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import ProgressSpinner from "primevue/progressspinner";
import { useRouter } from "vue-router";
import { motion } from 'motion-v';

const router = useRouter();
function Return() {
  router.push("/setup/client-server-selection");
}

function SelectClient() {
  window.ipcRenderer.invoke("SetAutoGen", false);
  router.push("/setup/toggl-manual-connect");
}
</script>

<template>
  <SetupBackground/>
  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12
             flex flex-col justify-between
             w-full max-w-[60rem] bg-black min-h-screen"
    >
    <div class="flex flex-col items-start space-y-10 w-full">
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{duration:0.6}}"
        class="flex flex-col items-start space-y-6"
      >
        <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                   font-semibold text-white leading-tight">
          There was an errror while connecting to Toggl Track
        </h1>
        <div class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          Should you continue to experience this issue, please submit a new issue on our GitHub
          repository—providing as much detail as possible and we’ll investigate and address it promptly.
        </div>
      </motion.div>
    </div>
      <div class="flex justify-end">
        <Button
          @click="SelectClient"
          class="w-[300px] p-3 !rounded-full"
          >
          <span class="text-xl font-bold text-black">Try again</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>

