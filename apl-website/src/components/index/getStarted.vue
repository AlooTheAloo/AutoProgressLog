<script setup lang="ts">
import { Motion } from "motion-v";
import { Button } from "../ui/button";
import { useRouter } from "vue-router";

const router = useRouter();

function openDownloads() {
  router.push("/downloads");
}
</script>

<style>
@keyframes scanner {
  from {
    -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
  }
  to {
    -webkit-mask-position: 200% 100%;
            mask-position: 200% 100%;
  }
}

.animate-scanner {
  animation: scanner 2s linear infinite;
  will-change: mask-position, -webkit-mask-position;
}
</style>


<template>
  <section class="relative w-full py-24  dark:bg-black flex justify-center">
    <div
      class="
        absolute inset-0 z-0 h-full w-full
        bg-white dark:bg-black
        bg-[radial-gradient(#1f2937_1px,transparent_1px)]
        dark:bg-[radial-gradient(#ffffff33_1px,transparent_1px)]
        [background-size:16px_16px]

        [mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_55%,transparent_100%)]
        [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_55%,transparent_100%)]

        [mask-size:200%_100%]
        [-webkit-mask-size:200%_100%]

        [mask-position:0%_0%]
        [-webkit-mask-position:0%_0%]

        animate-scanner
      "
    ></div>
    <Motion
      as="div"
      :initial="{ opacity: 0, filter: 'blur(10px)' }"
      :while-in-view="{
        opacity: 1,
        filter: 'blur(0px)',
      }"
      :transition="{
        delay: 0,
        duration: 1,
        ease: 'easeInOut',
      }"
      class="w-full relative z-10 flex items-center justify-center px-4"
    >
      <div class="flex flex-col sm:flex-row gap-8 items-center justify-between w-full max-w-4xl">
        <div class="flex flex-col text-center sm:text-left gap-2">
          <p
            class="bg-gradient-to-br from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl dark:from-white dark:to-neutral-400"
          >
            Make every minute count.
          </p>
          <p
            class="text-xl font-medium text-neutral-600 dark:text-neutral-300 sm:text-2xl"
          >
            Start today, it's free!
          </p>
        </div>

        <Motion
          as="div"
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :while-in-view="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }"
          :transition="{
            delay: 0.2,
            duration: 0.8,
            ease: 'easeOut',
          }"
          class="flex-shrink-0"
        >
          <Button
            class="text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            @click="openDownloads"
            size="lg"
          >
            Download the app
          </Button>
        </Motion>
      </div>
    </Motion>
  </section>
</template>
