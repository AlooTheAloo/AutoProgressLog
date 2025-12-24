<script setup lang="ts">
import { Motion } from "motion-v";
import report from "../../assets/Report_example.jpg";
</script>

<template>
  <section
    class="relative w-full py-24 overflow-hidden flex justify-center items-center bg-white dark:bg-black"
  >
    <div class="container px-4 md:px-6 z-10 relative">
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
        class="flex flex-col items-center space-y-4 text-center mb-10"
      >
        <h2
          class="text-4xl font-bold tracking-tighter sm:text-5xl text-black dark:text-white"
        >
          Your Progress, Visualized.
        </h2>
        <p
          class="max-w-[900px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-neutral-400"
        >
          Generate delightful progress reports at the click of a button.
        </p>
      </Motion>

      <Motion
        :initial="{ opacity: 0, scale: 0.95, y: 40 }"
        :while-in-view="{ opacity: 1, scale: 1, y: 0 }"
        :transition="{ duration: 1, delay: 0.2, ease: 'easeOut' }"
        class="mx-auto mt-8 max-w-xl relative rounded-xl bg-white dark:bg-zinc-950 shadow-2xl dark:shadow-none overflow-hidden p-2 md:p-4"
      >
        <div class="relative rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-inner">
          <img
            :src="report"
            alt="App Screenshot"
            class="w-full h-auto object-cover"
          />
        </div>
      </Motion>
    </div>
  </section>
</template>
