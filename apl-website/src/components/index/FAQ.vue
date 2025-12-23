<script setup lang="ts">
import { ref } from "vue";
import { PlusIcon, MinusIcon } from "@heroicons/vue/24/outline";

const faqs = [
  {
    question: "Is AutoProgressLog free?",
    answer:
      "Yes! APL is completely free and open source. We believe in accessible language learning tools for everyone. You can view our source code on GitHub.",
  },
  {
    question: "How does the tracking work?",
    answer:
      "APL integrates with tools you already use like Toggl Track and Anki. It silently syncs your data in the background, so you don't have to manually log anything.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "We actively support Windows, macOS, and Linux. Detailed installation instructions are available on our downloads page. A mobile app is also currently in the works.",
  },
  {
    question: "How do reports get generated??",
    answer:
      "You can either generate them manually or let them automatically generate every day at a set time.",
  },
];

const openIndex = ref<number | null>(null);

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>

<template>
  <section class="max-w-4xl mx-auto py-24 px-4 w-full">
    <div class="text-center mb-16">
      <h2
        class="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl"
      >
        Frequently Asked Questions
      </h2>
      <p class="mt-4 text-lg text-neutral-500 dark:text-neutral-400">
        Everything you need to know about AutoProgressLog.
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700"
      >
        <button
          @click="toggle(index)"
          class="flex items-center justify-between w-full p-6 text-left focus:outline-none bg-white dark:bg-neutral-900 z-10 relative"
        >
          <span class="text-lg font-semibold text-black dark:text-white">{{
            faq.question
          }}</span>
          <component
            :is="openIndex === index ? MinusIcon : PlusIcon"
            class="w-5 h-5 text-neutral-500 transition-transform duration-300"
            :class="{ 'rotate-180': openIndex === index }"
          />
        </button>
        <div
          class="overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out"
          :class="[
            openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0',
          ]"
        >
          <div
            class="px-6 pb-6 text-neutral-600 dark:text-neutral-300 leading-relaxed"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
