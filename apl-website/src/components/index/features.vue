<template>
  <div class="min-h-screen py-24 flex flex-col justify-center relative  bg-black">
    <div
      class=" z-10 absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full filter blur-[150px] opacity-20 animate-blob"
    ></div>
    <div
      class="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full filter blur-[150px] opacity-20 animate-blob animation-delay-2000"
    ></div>
    <div
      class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full filter blur-[150px] opacity-20 animate-blob animation-delay-4000"
    ></div>

    <div class="container mx-auto px-4 md:px-6 relative z-10 ">
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
        :inViewOptions="{ once: true }"
        class="flex flex-col w-full mb-16"
      >
        <h2
          class="md:text-left font-bold text-3xl text-center md:text-5xl dark:text-white mb-2"
        >
          Learning a language is complicated.
        </h2>

        <p
          class="font-extralight dark:text-neutral-200 text-center md:text-left w-full text-lg md:text-3xl"
        >
          Let's make it simpler.
        </p>
      </Motion>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
        <Motion
          as="div"
          v-for="(item, index) in gridItems"
          :key="item.title"
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :while-in-view="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }"
          :transition="{
            delay: index * 0.1,
            duration: 0.5,
            ease: 'easeOut',
          }"
          :inViewOptions="{ once: true }"
          class="h-full"
        >
          <div
            class="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-neutral-50 to-transparent dark:from-neutral-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            
            <div class="relative z-10 flex flex-col h-full justify-between gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white group-hover:scale-110 transition-transform duration-300"
              >
                <component :is="item.icon" class="w-6 h-6" />
              </div>
              
              <div class="space-y-2">
                <h3
                  class="text-xl font-bold text-neutral-900 dark:text-white leading-tight"
                >
                  {{ item.title }}
                </h3>
                <p class="text-neutral-500 dark:text-neutral-400 text-base">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { DocumentTextIcon, Cog8ToothIcon, ArrowPathIcon, CodeBracketSquareIcon } from "@heroicons/vue/24/outline";

const gridItems = [
  {
    area: "[grid-area:1/1/2/2]",
    icon: DocumentTextIcon,
    title: "Generate reports at the click of a button",
    description: "Showcase your data with a variety of data visualizations.",
    delay: 0,
  },
  {
    area: "[grid-area:2/1/3/2]",
    icon: Cog8ToothIcon,
    title: "Don't like it? Change it.",
    description:
      "Choose different integrations and customise the app to your needs.",
    delay: 0.4,
  },
  {
    area: "[grid-area:1/2/2/3]",
    icon: ArrowPathIcon,
    title: "Silent and efficient",
    description:
      "Synchronisations happen silently in the background. Just focus on what you do best.",
    delay: 0.2,
  },
  {
    area: "[grid-area:2/2/3/3]",
    icon: CodeBracketSquareIcon,
    title: "Open source",
    description: "Open source and completely free to use. No strings attached.",
    delay: 0.6,
  },
];
</script>
