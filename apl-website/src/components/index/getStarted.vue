<script setup lang="ts">
import { Motion } from "motion-v";
import {
  PATTERN_BACKGROUND_DIRECTION,
  PATTERN_BACKGROUND_SPEED,
  PATTERN_BACKGROUND_VARIANT,
} from "../ui/pattern-background";
import PatternBackground from "../ui/pattern-background/PatternBackground.vue";
import RainbowButton from "../ui/rainbow-button/RainbowButton.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function openDownloads() {
  router.push("/downloads");
}
</script>
<template>
  <div></div>
  <PatternBackground
    :animate="true"
    :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
    :variant="PATTERN_BACKGROUND_VARIANT.Dot"
    :speed="PATTERN_BACKGROUND_SPEED.Slow"
    class="flex gap-5 h-[20rem] w-full items-center justify-center [mask-image:radial-gradient(800px_circle_at_center,white,transparent)] absolute"
    size="sm"
  >
  </PatternBackground>

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
    class="w-full h-[20rem] flex items-center justify-center px-10"
  >
    <div class="flex flex-col sm:flex-row gap-2 sm:gap-0">
      <div class="flex flex-col w-full max-w-[40rem] px-10]">
        <p
          class="relative z-20 bg-gradient-to-l from-neutral-500 to-neutral-800 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
        >
          Make every minute count.
        </p>
        <p
          class="relative z-20 to-neutral-800 bg-clip-text text-xl font-semibold text-black sm:text-2xl"
        >
          Start today, it's free!
        </p>
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
          delay: 0.5,
          duration: 1,
          ease: 'easeInOut',
        }"
        class="flex flex-grow items-end sm:w-[16rem]"
      >
        <RainbowButton
          class="text-xs sm:text-base relative bg-black px-4 py-2 text-white flexw-12 flex-col items-center justify-center overflow-hidden rounded-full border shadow-xl"
          @click="openDownloads"
        >
          Download the app
        </RainbowButton>
      </Motion>
    </div>
  </Motion>
</template>
