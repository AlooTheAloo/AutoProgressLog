<script setup lang="ts">
import { useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Server from "../../../assets/Server.png";
import Client from "../../../assets/Client.png";
import Logo from "../../../assets/Logo.png";
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

  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between w-full max-w-[60rem] bg-black min-h-screen"
    >
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
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />
        <BackButton route="/setup/index" />
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
            class="relative bg-[#18181B] rounded-xl w-full sm:w-[24rem] h-72 cursor-pointer mx-auto sm:mx-0"
          >
            <div
              class="absolute top-0 left-0 bg-[#0FB4EC] px-2 h-6 text-xs rounded-br-xl flex items-center"
            >
              Recommended
            </div>
            <div
              class="w-full h-full flex flex-col justify-center items-center"
            >
              <img :src="Client" class="w-1/4 aspect-square" />
              <div class="mt-1 text-center text-2xl font-bold text-white">
                Manually
              </div>
              <div
                class="font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full text-gray-200"
              >
                Reports will have to be manually generated
              </div>
            </div>
          </div>
          <div
            v-ripple
            @click="SelectServer"
            class="bg-[#18181B] rounded-xl w-full sm:w-[24rem] h-72 cursor-pointer mx-auto sm:mx-0"
          >
            <div
              class="w-full h-full flex flex-col justify-center items-center"
            >
              <img :src="Server" class="w-1/4 aspect-square" />
              <div class="mt-1 text-center text-2xl font-bold text-white">
                Automatically
              </div>
              <div
                class="font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full text-gray-200"
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
