<template>
  <div
    class="absolute flex h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg lg:w-full md:w-full pointer-events-none"
  >
    <Ripple
      :space-between-circle="200"
      :wave-speed="100"
      class="bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      circle-class="border-[hsl(var(--primary))] bg-[#0000]/25 dark:bg-[#fff]/25 rounded-full"
    />
  </div>

  <div class="h-screen w-screen flex justify-center items-center">
    <Motion
      as="div"
      :initial="{ opacity: 0, y: 40, filter: 'blur(10px)' }"
      :while-in-view="{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }"
      :transition="{
        delay: 0,
        duration: 1.5,
        ease: 'easeInOut',
      }"
      class="flex justify-center items-center flex-col gap-10"
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
          <RainbowButton
            class="mt-5 w-52 p-0"
            v-if="platform !== 'other'"
            @click="externalOpen"
          >
            Download for {{ nicerName }}</RainbowButton
          >
          <div
            v-else
            class="mt-5 border-neutral-300 border-2 bg-neutral-200 w-fit px-2 h-10 rounded-lg cursor-not-allowed flex items-center justify-center text-neutral-500 select-none"
          >
            APL is not available for your platform yet
          </div>

          <Button class="p-0 mt-2" variant="link" @click="openGithub">
            Other download options
          </Button>
        </div>

        <div class="lg:block hidden">
          <div class="flex">
            <img v-if="platform == 'mac'" :src="macos_apl" class="w-[50rem]" />
            <img
              v-else-if="platform == 'windows'"
              :src="windows_apl"
              class="w-[35rem]"
            />
            <img
              v-else-if="platform == 'linux'"
              :src="linux_apl"
              class="w-[20rem]"
            />
          </div>
        </div>
      </div>

      <div
        class="flex gap-2 sm:gap-5 flex-wrap h-fit w-screen max-w-[70rem] px-10 justify-center"
      >
        <Motion
          v-for="(item, index) in items"
          as="div"
          :initial="{ opacity: 0, y: 40, filter: 'blur(10px)' }"
          :while-in-view="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }"
          :transition="{
            delay: index * 0.2,
            duration: 1,
            ease: 'easeInOut',
          }"
          class="transition-colors relative w-72 h-fit overflow-hidden rounded-xl border border-gray-950/[.1] bg-white p-7 hover:bg-gray-100 dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
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
        </Motion>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import Ripple from "@/components/ui/ripple/Ripple.vue";
import { BoxIcon, DownloadIcon, RocketIcon } from "lucide-vue-next";
import windows_apl from "../assets/APL_windows.png";
import macos_apl from "../assets/APL_Macbook.png";
import linux_apl from "../assets/APL_Linux.png";

import { computed, onMounted, ref } from "vue";
import RainbowButton from "@/components/ui/rainbow-button/RainbowButton.vue";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Motion } from "motion-v";

const items = [
  {
    name: "Download the app",
    icon: DownloadIcon,
    body: "Select your platform and download the executable.",
  },
  {
    name: "Install the program",
    icon: BoxIcon,
    body: "Open the downloaded file and follow the instructions.",
  },
  {
    name: "Launch APL",
    icon: RocketIcon,
    body: "Launch the program and start tracking your progress!",
  },
];

type Platform = "windows" | "mac" | "linux" | "other" | "all";

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
  return urls.value.find((x) => x.platform === platform.value)?.url;
});

const urls = ref<
  {
    platform: Platform;
    url: string;
  }[]
>([]);

function externalOpen() {
  const end = Date.now() + 0.3 * 1000; // 3 seconds
  const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

  // Frame function to trigger confetti cannons
  function frame() {
    if (Date.now() > end) return;

    // Left side confetti cannon
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 40,
      origin: { x: 0, y: 0.5 },
      colors: colors,
    });

    // Right side confetti cannon
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 40,
      origin: { x: 1, y: 0.5 },
      colors: colors,
    });

    requestAnimationFrame(frame); // Keep calling the frame function
  }
  frame();
  window.open(url.value, "_blank");
}

onMounted(() => {
  const BACKEND_URL = "https://apl.chromaserver.net/downloadLinks";
  fetch(BACKEND_URL).then(async (x) => {
    const data: {
      windowsUrl: string;
      macUrl: string;
      linuxUrl: string;
      releasesUrl: string;
    } = await x.json();
    urls.value = [
      {
        platform: "windows",
        url: data.windowsUrl,
      },
      {
        platform: "mac",
        url: data.macUrl,
      },
      {
        platform: "linux",
        url: data.linuxUrl,
      },
      {
        platform: "all",
        url: data.releasesUrl,
      },
    ];
  });
});

function openGithub() {
  window.open(urls.value.find((x) => x.platform === "all")?.url, "_blank");
}
</script>
