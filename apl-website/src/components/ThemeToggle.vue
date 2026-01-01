<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'
import { Motion } from 'motion-v'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <Motion
    :initial="{ opacity: 0, scale: 0.8, y: 20 }"
    :animate="{ opacity: 1, scale: 1, y: 0 }"
    :transition="{ duration: 0.5, delay: 1 }"
    class="fixed bottom-6 right-6 z-50"
  >
    <button
      @click="toggleDark()"
      class="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label="Toggle dark mode"
    >
      <div class="relative w-6 h-6">
        <Sun
          class="absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-500 transform"
          :class="isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'"
        />
        <Moon
          class="absolute inset-0 w-6 h-6 text-fuchsia-400 transition-all duration-500 transform"
          :class="isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'"
        />
      </div>
    </button>
  </Motion>
</template>

<style scoped>
button:hover {
  transform: translateY(-2px);
}
</style>
