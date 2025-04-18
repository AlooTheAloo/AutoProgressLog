<template>
  <Motion as="div" class="h-screen w-screen" :style="{ opacity: opacity }">
    <AuroraBackground>
      <PatternBackground
        :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
        :variant="PATTERN_BACKGROUND_VARIANT.Grid"
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
              delay: 0.3,
              duration: 0.8,
              ease: 'easeInOut',
            }"
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
              <TextHighlight
                :delay="500"
                :duration="1000"
                class="px-2 bg-gradient-to-r from-[#a1a4f8] to-[#1BFFFF] rounded-sm"
              >
                just works.
              </TextHighlight>
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
                delay: 1.1,
                duration: 0.8,
                ease: 'easeInOut',
              }"
              class="py-4 w-full flex gap-2 justify-center md:justify-start"
            >
              <RainbowButton
                @click="openDownloads"
                class="text-xs sm:text-base relative bg-black px-4 py-2 text-white flexw-12 flex-col items-center justify-center overflow-hidden rounded-full border shadow-xl"
              >
                Download the app
              </RainbowButton>
              <button
                class="text-xs sm:text-base relative bg-white text-black px-4 py-2 flex-12 flex-col items-center justify-center overflow-hidden rounded-full border shadow-xl"
              >
                Watch the trailer
              </button>
            </Motion>
          </Motion>
        </div>
      </PatternBackground>
    </AuroraBackground>
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
      class="absolute h-screen w-screen top-0 justify-end items-center pointer-events-none hidden md:flex overflow-hidden"
    >
      <div
        class="top-0 right-0 w-[40rem] translate-x-1/2 lg:translate-x-1/3 transition-all duration-20"
      >
        <img :src="macos_apl" />
      </div>
    </Motion>
  </Motion>
</template>

<script setup lang="ts">
import { Motion, useScroll, useTransform } from "motion-v";
import { AuroraBackground } from "../ui/aurora-background/";
import { PatternBackground } from "../ui/pattern-background";
import {
  PATTERN_BACKGROUND_DIRECTION,
  PATTERN_BACKGROUND_VARIANT,
} from "../ui/pattern-background";
import macos_apl from "../../assets/APL_Macbook.png";
import { RainbowButton } from "../ui/rainbow-button";
import TextHighlight from "../ui/text-highlight/TextHighlight.vue";
import { useRouter } from "vue-router";

const { scrollYProgress } = useScroll();

const opacity = useTransform(() => 1 - scrollYProgress.get());

const router = useRouter();

function openDownloads() {
  router.push("/downloads");
}
</script>
