<script setup lang="ts">
import ThemeToggle from "./components/ThemeToggle.vue";
</script>
<template>
  <div class="w-screen h-screen">
    <RouterView />
    <ThemeToggle />
  </div>
</template>
