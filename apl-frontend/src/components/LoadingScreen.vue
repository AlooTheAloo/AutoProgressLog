<script setup lang="ts">
import { motion } from 'motion-v'
import Logo from "../assets/Logo.png";
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-animate"></div>

      <motion.div
        :initial="{ opacity: 0, y: 30, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{duration:1.5}}"
        class="relative z-10 flex h-full w-full items-center justify-center"
      >
      <img :src="Logo" class="w-24 h-24" alt="APL Logo" />
      </motion.div>m
  </div>
</template>



<style scoped>
@keyframes slideGradient {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.bg-gradient-animate {
  background: linear-gradient(70deg,#000000, #06283f, #6e2380);
  background-size: 600% 600%;
  animation: slideGradient 6s ease infinite;
}
</style>
