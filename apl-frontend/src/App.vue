<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'

const router = useRouter();


if(window.ipcRenderer){
 
  window.ipcRenderer.on("router-push", (e, args: string) => {
    router.push(args);
  })
}

const updateOnlineStatus = () => {
  if(!window.ipcRenderer) return;
  window.ipcRenderer.invoke("SetInternetConnection", navigator.onLine);
}

window.addEventListener('online', updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)

updateOnlineStatus();

</script>

<template>
  <RouterView />
</template>
