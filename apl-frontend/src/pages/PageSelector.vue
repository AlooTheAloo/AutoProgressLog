<script setup lang="ts">
import { RouteLocationRaw, useRouter } from "vue-router";
const router = useRouter();
console.log("Its so time");
if (!window.ipcRenderer) {
  console.log("No IPC Renderer");
  router.push("/about");
} else {
  window.ipcRenderer.invoke("PageSelect").then((route: RouteLocationRaw) => {
    router.push(route);
  });
}
</script>

<template></template>
