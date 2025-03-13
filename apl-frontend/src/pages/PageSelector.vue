<script setup lang="ts">
import { RouteLocationRaw, useRouter } from "vue-router";
const router = useRouter();
if (!window.ipcRenderer) {
  router.push("/about");
} else {
  window.ipcRenderer.invoke("PageSelect").then((route: RouteLocationRaw) => {
    router.push(route);
  });
}
</script>

<template></template>
