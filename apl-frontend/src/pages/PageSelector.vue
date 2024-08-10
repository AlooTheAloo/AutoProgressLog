<script setup lang="ts">

    function sendToIPC() {
        console.log('Send IPCMain')
        window.ipcRenderer.invoke('open-win', 'www.youtube.com')
        
    }
</script>

<template>
  <div>
    <button @click="sendToIPC"> Send IPCMain</button>
  </div>
</template>