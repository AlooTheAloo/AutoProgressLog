<template>
  <div class="h-screen w-screen flex justify-center items-center overflow-hidden relative">

    <img :src="linux_bg" class="w-screen h-screen absolute" v-if="platform == 'linux'">

    <div v-else class="h-screen w-screen bg-gradient-to-br dark:from-[#1c0333] dark:via-[#000000] dark:to-[#000000] from-gray-200 via-fuchsia-200 to-stone-100 absolute">

    </div>

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
      class="flex justify-center items-center flex-col gap-10 z-10"
    >
      <div
        class="w-screen max-w-[70rem] lg:px-10 flex lg:justify-between justify-center"
      >
        <div class="flex flex-col justify-center items-center lg:items-start  ">
          <div class=" flex flex-col justify-center items-start" :class="platform == 'linux' ? 'transition-colors relative h-fit overflow-hidden rounded-xl border border-gray-950/[.1] bg-white p-7 hover:bg-gray-100 dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15] shadow-sm' : ''">
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
          <Button
            class="mt-5 w-52 p-6 text-base shadow-lg"
            v-if="platform !== 'other'"
            @click="externalOpen"
          >
            Download for {{ nicerName }}</Button
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
          
        </div>

        <div class="lg:block hidden">
          <div class="flex">
            <img v-if="platform == 'mac'" :src="macos_apl" class="w-[35rem]" />
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
          :key="item.name"
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
          class="transition-colors relative w-72 h-fit overflow-hidden rounded-xl border border-gray-950/[.1] bg-white p-7 hover:bg-gray-100 dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15] shadow-sm"
        >
          <div class="flex flex-row items-center gap-2">
            <component :is="item.icon" class="w-[32px] h-[32px] text-black dark:text-white" />
            <div class="flex flex-col">
              <span class="text-xl font-medium dark:text-white">
                {{ item.name }}
              </span>
            </div>
          </div>
          <blockquote class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ item.body }}
          </blockquote>
        </Motion>
      </div>
    </Motion>
  </div>


  <Dialog :open="dialogOpen">
    <form>
      <DialogContent class="sm:max-w-[600px] w-[90%] rounded-xl [&>button:last-child]:hidden">
        <DialogHeader>
          <div class="mt-2"></div>
          <DialogTitle class="text-left sm:text-center">Hey there! Thanks for downloading our app 🎉</DialogTitle>
          <DialogDescription class="text-left  sm:max-w-[550px]">
            We noticed you're on MacOS (great choice btw 😉). The app is currently unsigned. After dragging it into the Applications folder, you will need to tell your computer that it is safe to open it.
            To do this, open the Terminal application on your mac and run the following command : 
            <br />
            <div class="mt-3 w-full min-w-0 flex">
              <TerminalCommand
              class="flex-grow w-0"
                title="Terminal"
                command="sudo xattr -cr /Applications/AutoProgressLog.app"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogClose>
          <div class="grid gap-4">
            <Button @click="closeDialog">
              Awesome!
            </Button>
          </div>
        </DialogClose>
      </DialogContent>
    </form>
  </Dialog>


</template>

<script setup lang="ts">
import { CubeIcon, ArrowDownTrayIcon, RocketLaunchIcon } from "@heroicons/vue/24/outline";
import windows_apl from "../assets/APL_windows.png";
import macos_apl from "../assets/APL_Macbook.png";
import linux_apl from "../assets/APL_Linux.png";
import linux_bg from "../assets/linux_bg.png";

import { computed, onMounted, ref } from "vue";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Motion } from "motion-v";
import { UAParser } from "ua-parser-js";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import TerminalCommand from "@/components/download/TerminalCommand.vue";
import DialogClose from "@/components/ui/dialog/DialogClose.vue";

const items = [
  {
    name: "Download the app",
    icon: ArrowDownTrayIcon,
    body: "Select your platform and download the executable.",
  },
  {
    name: "Install the program",
    icon: CubeIcon,
    body: "Open the downloaded file and follow the instructions.",
  },
  {
    name: "Launch APL",
    icon: RocketLaunchIcon,
    body: "Launch the program and start tracking your progress!",
  },
];

type Platform = "windows" | "mac" | "linux" | "other" | "all";

const platform = ref<Platform>(getPlatform());

function getPlatform(): Platform {
  const uap = new UAParser();
  const os = uap.getOS();

  // No mobile support (yet...)
  if (uap.getDevice().type == "mobile") return "other";

  // No arm64 support on windows (thanks sharp)
  if (uap.getCPU().architecture == "arm64" && os.is("windows")) return "other";

  if (os.is("windows")) return "windows";
  if (os.is("mac") && uap.getDevice().type != "mobile") return "mac";
  if (os.is("linux")) return "linux";
  console.log("other");
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
  if(platform.value == "mac"){
    dialogOpen.value = true;
  }
}

function closeDialog() {
  dialogOpen.value = false;
} 

const dialogOpen = ref(false);

onMounted(() => {
  const BACKEND_URL = "https://api.aplapp.dev/download-links";
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
