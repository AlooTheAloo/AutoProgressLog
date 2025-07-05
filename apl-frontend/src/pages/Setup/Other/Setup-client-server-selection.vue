<script setup lang="ts">
import { useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Server from "../../../assets/Server.png";
import Client from "../../../assets/Client.png";
import Logo from "../../../assets/Logo.png";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import { useWindowSize } from "@vueuse/core";
import { motion } from "motion-v";

const router = useRouter();
const { height } = useWindowSize();

function SelectClient() {
  window.ipcRenderer.invoke("SetAutoGen", false);
  router.push("/setup/toggl-manual-connect");
}

function SelectServer() {
  window.ipcRenderer.invoke("SetAutoGen", true);
  router.push("/setup/server-setup");
}
</script>
<template>
  <SetupBackground />
  <div
    :style="{
      backgroundImage: `linear-gradient(to bottom right, #add8ff, #d8b4fe)`,
    }"
    class="relative flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />
    <div
      class="relative z-10 bg-black rounded-3xl p-12 /* 1) column flex that spans full height */ flex flex-col justify-between items-start h-[90vh] max-h-[946px] /* your height rules */ /* 2) width clamped between min & max */ w-full max-w-[899px] min-w-[600px]"
    >
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6 },
        }"
        class="flex flex-col items-start space-y-7"
      >
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
        >
          How do you want to generate reports?
        </h1>
        <p
          class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
        >
          APL can generate reports automatically for you. Select automatic
          generation only if you know that your computer will always be turned
          on and connected to the internet.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div
            v-ripple
            @click="SelectClient"
            class="relative bg-[#FFFFFF] rounded-xl w-full sm:w-[24rem] h-72 cursor-pointer mx-auto sm:mx-0"
          >
            <div
              class="absolute top-0 left-0 bg-[#0FB4EC] px-4 h-7 text-xs text-black font-bold rounded-br-xl flex items-center"
            >
              Recommended
            </div>
            <div
              class="w-full h-full flex flex-col justify-center items-center"
            >
              <img :src="Client" class="w-1/4 aspect-square" />
              <div class="mt-1 text-center text-2xl font-bold text-black">
                Manually
              </div>
              <div
                class="font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full text-black"
              >
                Reports will have to be manually generated
              </div>
            </div>
          </div>
          <div
            v-ripple
            @click="SelectServer"
            class="bg-[#FFFFFF] relative rounded-xl w-full sm:w-[24rem] h-72 cursor-pointer mx-auto sm:mx-0"
          >
            <div
              class="w-full h-full flex flex-col justify-center items-center"
            >
              <img :src="Server" class="w-1/4 aspect-square" />
              <div class="mt-1 text-center text-2xl font-bold text-black">
                Automatically
              </div>
              <div
                class="font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full text-black"
              >
                Reports will be generated automatically at a specific time
                interval
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
