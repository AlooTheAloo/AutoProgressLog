<script setup lang="ts">
import { useRouter } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
import Button from "primevue/button";
import Logo from "../../../assets/Logo.png";
import { motion } from "motion-v";
import { onMounted } from "vue";
import { ThemeManager } from "../../../util/theme-manager";

const router = useRouter();
function NextPage() {
  router.push("/setup/auth");
}
const { height } = useWindowSize();

onMounted(() => {
  ThemeManager.setTheme("dark");
});
</script>
<template>
  <div
    :style="{
      'background-image': `linear-gradient(to bottom right, #add8ff, #d8b4fe)`,
    }"
    class="flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />
    <div
      class="relative z-10 bg-black rounded-3xl p-12 flex flex-col items-center justify-center w-full max-w-[899px] min-w-[600px] h-[90vh] max-h-[946px]"
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
          class="w-24 h-24 md:w-20 md:h-20 sm:w-16 sm:h-16 block mb-4"
        />
        <h1 class="text-6xl font-semibold text-white leading-tight">
          The immersion tracking app that
          <span class="text-[#0FB4EC]">just works.</span>
        </h1>
        <Button @click="NextPage" class="w-[300px] p-3 rounded-full self-start">
          <span class="text-xl font-bold text-black">Get started!</span>
        </Button>
      </motion.div>
    </div>
  </div>
</template>

<style scoped>
.fade-up-enter-active {
  transition:
    opacity 1s ease,
    transform 0.6s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
