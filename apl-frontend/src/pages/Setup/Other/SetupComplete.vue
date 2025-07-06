<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRoute, useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import { motion } from "motion-v";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";

const router = useRouter();
const savingDone = ref<boolean>(false);

function NextPage() {
  window.ipcRenderer.invoke("SetupComplete").then(() => {
    router.push("/app/dashboard");
  });
}

onMounted(() => {
  window.ipcRenderer.invoke("SaveConfig").then(() => {
    savingDone.value = true;
  });
});
</script>

<template>
  <SetupBackground />
  <div
    :style="{
      'background-image': `linear-gradient(to bottom right, #add8ff, #d8b4fe)`,
    }"
    class="flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />
    <div
      class="relative z-10 bg-black rounded-3xl p-12 flex flex-col items-start justify-center w-full max-w-[899px] min-w-[600px] h-[90vh] max-h-[946px]"
    >
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 1 },
        }"
        class="flex flex-col items-start space-y-8"
      >
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-24 h-24 md:w-20 md:h-20 sm:w-16 sm:h-16 block"
        />
        <h1 class="text-6xl font-semibold text-white leading-tight">
          You're all set!<br />
          Enjoy the app<span class="text-[#0FB4EC]">!</span>
        </h1>
        <Button
          :disabled="!savingDone"
          @click="NextPage"
          class="w-[300px] p-3 rounded-full self-start"
        >
          <span class="text-xl font-bold text-black">Go to dashboard</span>
        </Button>
      </motion.div>
    </div>
  </div>
</template>
