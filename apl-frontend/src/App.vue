<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter();

window.ipcRenderer.on("router-push", (e, args: string) => {
  router.push(args);
})
</script>

<template>
  <RouterView />
</template>
