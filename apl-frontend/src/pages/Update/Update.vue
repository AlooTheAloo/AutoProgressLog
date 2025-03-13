<script setup lang="ts">
import { onMounted, ref } from "vue";
import { shuffle } from "../../util/shuffle";

const update_names = [
  "updates",
  "bells and whistles",
  "features",
  "bug fixes",
  "performance improvements",
  "security updates",
  "integrations",
];

const message = ref("Preparing");

window.ipcRenderer.on("update-update-message", (evt, data: string) => {
  console.log("update available", data);
  message.value = data;
});

onMounted(() => {
  window.ipcRenderer.invoke("Update-App-Schema").then((x) => {
    console.log("ans is " + x);
  });
});
</script>

<template>
  <div class="absolute w-screen h-screen flex items-center justify-center">
    <div class="flex text-3xl">
      <VueWriter
        :array="shuffle(update_names)"
        :eraseSpeed="50"
        :typeSpeed="50"
        :delay="2000"
        :intervals="200"
      >
        <p class="inline mr-1">Downloading new</p>
      </VueWriter>
      <span class="inline -ml-1 underscore font-extrabold text-[#89bdff]"
        >_</span
      >
    </div>
  </div>
  <div class="absolute w-screen h-screen flex items-end justify-center">
    <div class="mb-5">{{ message }}...</div>
  </div>
</template>
