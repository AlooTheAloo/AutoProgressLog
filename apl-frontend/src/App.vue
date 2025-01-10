<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter();

window.ipcRenderer.on("router-push", (e, args: string) => {
  router.push(args);
})

const updateOnlineStatus = () => {
  console.log("Updating online status to " + navigator.onLine);
  window.ipcRenderer.invoke("SetInternetConnection", navigator.onLine);
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

updateOnlineStatus();

</script>

<template>
  <RouterView />
</template>
