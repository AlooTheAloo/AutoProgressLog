<script setup lang="ts">
import { Motion } from "motion-v";
import AplLogo from "../../assets/Logo.png";
import TogglLogo from "../../assets/Toggl_logo.png";
import AnkiLogo from "../../assets/Anki_logo.png";
import DiscordLogo from "../../assets/discord_logo.webp";
</script>
<template>
  <section class="py-24 bg-neutral-50 dark:bg-black w-full overflow-hidden">
    <div class="container mx-auto px-4 md:px-6">
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
        class="text-center mb-16 space-y-4"
      >
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl text-black dark:text-white">
          Use the tools you
          <span class="text-blue-600 dark:text-blue-400">already love</span>
        </h2>
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          No extra configuration required. We integrate seamlessly with your existing workflow.
        </p>
      </Motion>

      <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        <!-- Tools -->
        <div class="flex flex-col gap-6">
          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.2 }"
            class="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 w-64"
          >
            <div class="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded-lg p-2">
              <img :src="TogglLogo" alt="Toggl" class="w-full h-full object-contain" />
            </div>
            <span class="font-semibold text-lg dark:text-white">Toggl Track</span>
          </Motion>

          <Motion
            :initial="{ opacity: 0, x: -20 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.3 }"
            class="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 w-64"
          >
            <div class="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded-lg p-2">
              <img :src="AnkiLogo" alt="Anki" class="w-full h-full object-contain" />
            </div>
            <span class="font-semibold text-lg dark:text-white">Anki</span>
          </Motion>
          
           <Motion
            :initial="{ opacity: 0, x: -20 }"
            :while-in-view="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.4 }"
            class="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 w-64"
          >
            <div class="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded-lg p-2">
              <img :src="DiscordLogo" alt="Discord" class="w-full h-full object-contain" />
            </div>
            <span class="font-semibold text-lg dark:text-white">Discord</span>
          </Motion>
        </div>


         <Motion
          :initial="{ opacity: 0, scale: 1 }"
          :while-in-view="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.75 }"
            class=""
          >
 <!-- Connection Visual -->
        <div class="hidden md:flex flex-col items-center justify-center text-neutral-300 dark:text-neutral-700 scale-[133%]">
          <svg width="100" height="200" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C40 20 60 80 80 100M0 100C40 100 60 100 80 100M0 180C40 180 60 120 80 100" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/>
            <circle cx="85" cy="100" r="4" fill="currentColor" />
          </svg>
        </div>
          </Motion>
               


        <!-- APL Logo -->
        <Motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :while-in-view="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.5, type: 'spring' }"
          class="relative w-48 h-48 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-800"
        >
          <div class=""></div>
          <img :src="AplLogo" alt="APL" class="w-32 h-32 object-contain relative z-10" />
        </Motion>
      </div>
    </div>
  </section>
</template>
