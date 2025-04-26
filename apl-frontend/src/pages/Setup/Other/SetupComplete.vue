<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRoute, useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import { onMounted } from "vue";
import { motion } from 'motion-v';

const router = useRouter();

function NextPage() {
  window.ipcRenderer.invoke("SetupComplete").then(() => {
    router.push("/app/dashboard");
  });
}

onMounted(() => {
  window.ipcRenderer.invoke("SaveConfig");
});
</script>

<template>
  <SetupBackground />
  <div class="flex">

    <div class="p-12 w-full max-w-[60rem] bg-black min-h-screen flex flex-col justify-center">
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1 } }"
        class="flex flex-col items-start space-y-8"
      >
        <img :src="Logo"alt="APL Logo"class="w-24 h-24 md:w-20 md:h-20 sm:w-16 sm:h-16 block"/>
        <h1 class="text-6xl font-semibold text-white leading-tight">
          You're all set!<br/>
          Enjoy the app<span class="text-[#0FB4EC]">!</span>
        </h1>
        <Button
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full self-start"
        >
          <span class="text-xl font-bold text-black">Go to dashboard</span>
        </Button>
      </motion.div>
    </div>
  </div>
</template>
