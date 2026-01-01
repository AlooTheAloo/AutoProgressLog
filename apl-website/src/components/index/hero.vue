<template>
  <div
    class="absolute inset-0 -z-10 w-screen bg-white dark:bg-black bg-[linear-gradient(to_right,#8080802f_1px,transparent_1px),linear-gradient(to_bottom,#8080801f_2px,transparent_1px)] bg-[size:24px_24px]"
  >
    <div class="animated-blob bg-fuchsia-400 dark:bg-fuchsia-800"></div>
  </div>
  <Motion as="div" class="h-screen w-screen" :style="{ opacity: 1 }">
    <div
      class="flex h-screen w-screen items-center md:justify-start justify-center"
    >
      <div>
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
            duration: 1,
            ease: 'easeInOut',
          }"
          :inViewOptions="{ once: true }"
          class="flex justify-center md:justify-start"
        >
          <img
            :src="apl_logo_black"
            class="dark:hidden relative flex flex-col mx-20 w-20 mb-5 shadow-xl rounded-2xl"
          />
          <img
            :src="apl_logo_white"
            class="hidden dark:flex relative flex-col mx-20 w-20 mb-5 shadow-xl rounded-2xl"
          />
        </Motion>

        <Motion
          as="div"
          :initial="{ opacity: 0, y: 40, filter: 'blur(10px)' }"
          :while-in-view="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }"
          :transition="{
            delay: 0.2,
            duration: 1,
            ease: 'easeInOut',
          }"
          :inViewOptions="{ once: true }"
          class="relative flex flex-col my-4 w-full md:px-20 px-10"
        >
          <div
            class="text-center md:text-left font-bold text-7xl dark:text-white"
          >
            Track.
            <br />
            Learn.
            <br />
            Achieve.
          </div>

          <div
            class="lg:text-3xl text-2xl text-center font-extralight dark:text-neutral-200 md:text-left w-full"
          >
            The immersion tracking app that
            <span
              class="text-blue-600 rounded-sm text-blue font-bold"
            >
              just works.
            </span>
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
              delay: 0.4,
              duration: 1,
              ease: 'easeInOut',
            }"
            :inViewOptions="{ once: true }"
            class="py-4 w-full flex gap-2 justify-center md:justify-start"
          >
            <Button
              @click="openDownloads"
              class="text-xs sm:text-base relative bg-black hover:bg-black/80 px-8 py-6 text-white flex-col items-center justify-center overflow-hidden rounded-full shadow-xl"
            >
              Download the app
            </Button>
            <Button
              @click="openDialog"
              variant="outline"
              class="text-xs sm:text-base flex relative bg-white text-black px-8 py-6 flex-12 flex-col items-center justify-center overflow-hidden rounded-full shadow-md"
            >
              Watch the trailer
            </Button>
          </Motion>
        </Motion>
      </div>
    </div>
    <Motion
      as="div"
      :initial="{ opacity: 0, filter: 'blur(10px)' }"
      :while-in-view="{
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
      }"
      :transition="{
        delay: 0.3,
        duration: 0.8,
        ease: 'easeInOut',
      }"
      :inViewOptions="{ once: true }"
      class="absolute h-screen w-screen top-0 justify-end items-center pointer-events-none hidden md:flex overflow-hidden"
    >
      <div
        class="top-0 right-0 w-[40rem] translate-x-1/2 lg:translate-x-1/3 transition-all duration-20"
      >
        <img :src="macos_apl" />
      </div>
    </Motion>
  </Motion>

  <Dialog :open="dialogOpen">
    <form>
      <DialogContent class=" w-[90vw] max-w-[1000px] rounded-xl [&>button:last-child]:hidden bg-white dark:bg-black">
        <DialogHeader>
          <DialogDescription class="text-left">
            <iframe class="w-full aspect-video" :src="trailerSource" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </DialogDescription>
        </DialogHeader>
        <DialogClose>
          <div class="grid gap-4">
            <Button @click="closeDialog" class="bg-[#EB3D3D] text-black hover:bg-[#D73535]">
              Close window
            </Button>
          </div>
        </DialogClose>
      </DialogContent>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import apl_logo_black from "../../assets/APL_Black.svg";
import apl_logo_white from "../../assets/Logo.png";

import macos_apl from "../../assets/APL_Macbook.png";

import { useRouter } from "vue-router";
import Button from "../ui/button/Button.vue";
import { onMounted, ref } from "vue";
import Dialog from "../ui/dialog/Dialog.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import DialogHeader from "../ui/dialog/DialogHeader.vue";
import DialogDescription from "../ui/dialog/DialogDescription.vue";
import DialogClose from "../ui/dialog/DialogClose.vue";


const trailerSource = ref("");



const router = useRouter();

const dialogOpen = ref(false);

function openDialog() {
  dialogOpen.value = true;
  if(Math.random() > 0.50){
    trailerSource.value = "https://youtube.com/embed/qLt7HWdLydo?si=7uzEyXAjT2_yCyng&t=0&autoplay=1&rel=0";
  }
  else {
    trailerSource.value = "https://youtube.com/embed/QBVXpKHH5cs?autoplay=1&rel=0";
  }
}

onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  } 
})


function closeDialog() {
  dialogOpen.value = false;
}

function openDownloads() {
  router.push("/downloads");
}

</script>

<style>
@keyframes animatedBlob {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(3);
    opacity: 0.15;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
    filter: blr(80px);
  }
}

.animated-blob {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  margin: auto;
  height: 310px;
  width: 310px;
  z-index: -10;
  border-radius: 9999px;
  opacity: 0.2;
  filter: blur(100px);
  animation: animatedBlob 10s ease-in-out infinite;
}
</style>
