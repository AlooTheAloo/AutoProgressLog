<script setup lang="ts">
import { RouteLocationRaw, useRoute, useRouter } from 'vue-router';
const router = useRouter()    
window.ipcRenderer.invoke('PageSelect').then((route:RouteLocationRaw) => {
  router.push(route);
})
</script>

<template>

</template>