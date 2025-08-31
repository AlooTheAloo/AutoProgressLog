<script setup lang="ts">
import { onMounted, ref } from "vue";
import { motion } from "motion-v";
import { shuffle } from "../../util/shuffle";
import { useRouter } from "vue-router";
import Logo from "../../assets/Logo.png";
import PlexusEffect from "../../components/Common/PlexusEffect.vue";

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

const router = useRouter();

window.ipcRenderer.on("2_0_0_upgrade", (evt, data: string) => {
  router.push("/update/2_0_0");
});

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
  <div class="relative w-screen h-screen overflow-hidden">
    <PlexusEffect />

    <motion.div
      class="absolute inset-0 flex flex-col items-center justify-center space-y-4"
      :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
      :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6 } }"
    >
      <img
        :src="Logo"
        alt="APL Logo"
        class="w-12 h-12 sm:w-16 sm:h-16"
      />
      <div class="flex text-3xl text-white">
        <VueWriter
          :array="shuffle(update_names)"
          :eraseSpeed="50"
          :typeSpeed="50"
          :delay="2000"
          :intervals="200"
        >
          <p class="inline mr-1">Downloading new</p>
        </VueWriter>
        <span
          class="inline -ml-1 underscore font-extrabold text-[#89bdff]"
          >_</span
        >
      </div>
    </motion.div>
    <motion.div
      class="absolute inset-x-0 bottom-0 flex justify-center pb-6"
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.6 } }"
    >
      <div class="text-white">{{ message }}…</div>
    </motion.div>
  </div>
</template>

