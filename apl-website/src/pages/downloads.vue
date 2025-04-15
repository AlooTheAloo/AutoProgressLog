<template>
  <div
    class="absolute flex h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg lg:w-full md:w-full pointer-events-none"
  >
    <Ripple
      class="bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      circle-class="border-[hsl(var(--primary))] bg-[#0000]/25 dark:bg-[#fff]/25 rounded-full"
    />
  </div>

  <div
    class="flex justify-center items-center flex-col h-screen w-screen gap-10"
  >
    <div
      class="w-screen max-w-[70rem] lg:px-10 flex lg:justify-between justify-center"
    >
      <div class="flex flex-col justify-center items-center lg:items-start">
        <h1
          class="lg:text-start text-center text-3xl font-semibold dark:text-neutral-200 w-full"
        >
          You're almost there!
        </h1>
        <h2
          class="lg:text-start text-center text-neutral-600 text-2xl font-light dark:text-neutral-200 w-full"
        >
          Get ready to start your journey with APL.
        </h2>
        <RainbowButton class="mt-5 w-52 p-0" v-if="platform !== 'other'">
          Download for {{ nicerName }}</RainbowButton
        >
        <div
          v-else
          class="mt-5 border-neutral-300 border-2 bg-neutral-200 w-fit px-2 h-10 rounded-lg cursor-not-allowed flex items-center justify-center text-neutral-500 select-none"
        >
          APL is not available for your platform yet
        </div>
      </div>

      <div class="lg:block hidden">
        <div class="flex">
          <img :src="macos_apl" width="300" />
        </div>
      </div>
    </div>

    <div
      class="flex gap-2 sm:gap-5 flex-wrap h-fit w-screen max-w-[70rem] px-10 justify-center"
    >
      <figure
        v-for="item in items"
        class="transition-all duration-200 relative w-72 h-fit overflow-hidden rounded-xl border border-gray-950/[.1] bg-white p-7 hover:bg-gray-100 dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      >
        <div class="flex flex-row items-center gap-2">
          <component :is="item.icon" class="w-[32px] h-[32px] text-black" />
          <div class="flex flex-col">
            <span class="text-xl font-medium dark:text-white">
              {{ item.name }}
            </span>
          </div>
        </div>
        <blockquote class="mt-2 text-sm">
          {{ item.body }}
        </blockquote>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import Ripple from "@/components/ui/ripple/Ripple.vue";
import { BoxIcon, DownloadIcon, RocketIcon } from "lucide-vue-next";
import macos_apl from "../assets/APL_Macbook.png";
import { computed, onMounted, ref } from "vue";
import RainbowButton from "@/components/ui/rainbow-button/RainbowButton.vue";
const items = [
  {
    name: "Download the app",
    icon: DownloadIcon,
    body: "Select your platform and download the executable.",
  },
  {
    name: "Install the program",
    icon: BoxIcon,
    body: "Select your platform and download the executable.",
  },
  {
    name: "Launch APL",
    icon: RocketIcon,
    body: "Select your platform and download the executable.",
  },
];

type Platform = "windows" | "mac" | "linux" | "other";

const platform = ref<Platform>(getPlatform());

function getPlatform(): Platform {
  const agent = window.navigator.userAgent;
  if (agent.indexOf("Windows") != -1) return "windows";
  if (agent.indexOf("Mac") != -1) return "mac";
  if (agent.indexOf("Linux") != -1) return "linux";
  return "other";
}

const nicerName = computed(() => {
  switch (platform.value) {
    case "windows":
      return "Windows";
    case "mac":
      return "MacOS";
    case "linux":
      return "Linux";
  }
});

const url = computed(() => {
  switch (platform.value) {
    case "windows":
      return "https://github.com/AlooTheAloo/AutoProgressLog/releases/download/v1.0.0/AutoProgressLog.exe";
    case "mac":
      return "https://github.com/AlooTheAloo/AutoProgressLog/releases/download/v1.0.0/AutoProgressLog.dmg";
    case "linux":
      return "https://github.com/AlooTheAloo/AutoProgressLog/releases/download/v1.0.0/AutoProgressLog.AppImage";
  }
});

const urls = ref<
  {
    platform: Platform;
    url: string;
  }[]
>([]);

onMounted(() => {
  const BACKEND_URL = "https://apl.chromaserver.net/api";
  fetch("https://");
});
</script>
