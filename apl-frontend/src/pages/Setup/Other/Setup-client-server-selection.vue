<script setup lang="ts">
import { useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Server from "../../../assets/Server.png";
import Client from "../../../assets/Client.png";
import Logo from "../../../assets/Logo.png";
import BackButton from "../../../components/Common/BackButton.vue";
import { useWindowSize } from "@vueuse/core";

const router = useRouter();
const { height } = useWindowSize();

function SelectClient() {
  window.ipcRenderer.invoke("SetAutoGen", false);
  router.push("/setup/toggl-manual-connect");
}

function SelectServer() {
  window.ipcRenderer.invoke("SetAutoGen", true);
  router.push("/setup/toggl-auto");
}
</script>

<template>
  <SetupBackground />

  <div class="flex w-screen">
    <div class="p-12 flex flex-col w-2/4 bg-black h-screen">
      <Transition name="fade-up" appear>
      <div class="mx-auto w-[51rem] flex flex-col items-start space-y-8 mt-16">
        <div v-if="height > 650">
          <img :src="Logo" alt="APL Logo" class="w-20 h-20" />
        </div>
        <BackButton route="/setup/index" />
        <h1 class="text-5xl font-semibold text-white">
          How do you want to generate reports?
        </h1>
        <p class="text-xs lg:text-sm leading-relaxed text-[#C0C0C0]">
          APL can generate reports automatically for you. Select automatic
          generation only if you know that your computer will always be turned
          on and connected to the internet.
        </p>
        <div class="flex w-full justify-between gap-12 select-none">
          <div
            v-ripple
            @click="SelectClient"
            class="relative bg-[#18181B] rounded-xl w-[24rem] h-72 cursor-pointer"
          >
            <div
              class="absolute top-0 left-0 bg-[#0FB4EC] px-2 h-6 text-xs rounded-br-xl flex items-center"
            >
              Recommended
            </div>
            <div class="w-full h-full flex flex-col justify-center items-center">
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
            class="bg-[#18181B] rounded-xl w-[24rem] h-72 cursor-pointer"
          >
            <div class="w-full h-full flex flex-col justify-center items-center">
              <img :src="Server" class="w-1/4 aspect-square" />
              <div class="mt-1 text-center text-2xl font-bold text-white">
                Automatically
              </div>
              <div
                class="font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full text-gray-200"
              >
                Reports will be generated automatically at a specific time interval
              </div>
            </div>
          </div>
        </div>

      </div>
    </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-up-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>