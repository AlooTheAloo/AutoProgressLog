<template>
  <div class="h-screen flex flex-col">
    <WarpBackground class="h-full">
      <Motion
        as="div"
        :initial="{ opacity: 0, x: -40, filter: 'blur(10px)' }"
        :while-in-view="{
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
        }"
        :transition="{
          delay: 0,
          duration: 0.8,
          ease: 'easeInOut',
        }"
        class="absolute flex flex-col w-full p-10"
      >
        <div
          class="md:text-left font-bold text-2xl text-center md:text-5xl dark:text-white"
        >
          Learning a language is complicated.
        </div>

        <div
          class="font-extralight dark:text-neutral-200 text-center md:text-left w-full text-lg md:text-3xl"
        >
          Let's make it simpler.
        </div>
      </Motion>

      <div
        class="flex h-screen flex-col items-center justify-center w-full overflow-hidden"
      >
        <ul class="grid grid-cols-2 grid-rows-2 gap-4">
          <Motion
            as="li"
            v-for="item in gridItems"
            :key="item.title"
            :class="cn('list-none w-full md:w-96', item.area)"
            :initial="{ opacity: 0, x: 0, y: 20, filter: 'blur(10px)' }"
            :while-in-view="{
              opacity: 1,
              x: 0,
              y: 0,
              filter: 'blur(0px)',
            }"
            :transition="{
              delay: item.delay,
              duration: 0.8,
              ease: 'easeInOut',
            }"
            :inViewOptions="{ once: true }"
          >
            <div class="bg-white relative h-full border p-2 rounded-3xl md:p-3">
              <GlowingEffect
                :spread="40"
                :glow="true"
                :disabled="false"
                :proximity="40"
                :border-width="2"
                :movement-duration="0"
                :variant="'white'"
              />
              <div
                class="border-0.75 relative flex h-full flex-col overflow-hidden rounded-xl p-2 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]"
              >
                <div
                  class="relative flex flex-1 flex-col justify-between gap-2"
                >
                  <div class="w-fit rounded-lg border border-gray-600 p-2">
                    <component
                      :is="item.icon"
                      class="w-6 h-6 text-gray-600 dark:text-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <h3
                      class="-tracking-4 text-balance pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-black md:text-2xl/[1.875rem] dark:text-white"
                    >
                      {{ item.title }}
                    </h3>
                    <h2
                      class="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold"
                    >
                      {{ item.description }}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </Motion>
        </ul>
      </div>
    </WarpBackground>
  </div>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "../ui/glowing-effect";
import { File, PackageOpen, RefreshCcw, Settings } from "lucide-vue-next";
import WarpBackground from "../ui/warp-background/WarpBackground.vue";

const gridItems = [
  {
    area: "[grid-area:1/1/2/2]",
    icon: File,
    title: "Generate reports at the click of a button",
    description: "Showcase your data with a variety of data visualizations.",
    delay: 0,
  },
  {
    area: "[grid-area:2/1/3/2]",
    icon: Settings,
    title: "Don't like it? Change it.",
    description:
      "Choose different integrations and customise the app to your needs.",
    delay: 0.4,
  },
  {
    area: "[grid-area:1/2/2/3]",
    icon: RefreshCcw,
    title: "Silent and efficient",
    description:
      "Synchronisations happen silently in the background. Just focus on what you do best.",
    delay: 0.2,
  },
  {
    area: "[grid-area:2/2/3/3]",
    icon: PackageOpen,
    title: "Open source",
    description: "Open source and completely free to use. No strings attached.",
    delay: 0.6,
  },
];
</script>
