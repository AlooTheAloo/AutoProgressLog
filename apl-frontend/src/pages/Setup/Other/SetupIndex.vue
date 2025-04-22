<script setup lang="ts">
import { useRouter } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import Logo from "../../../assets/Logo.png";

const router = useRouter();
function NextPage() {
  router.push("/setup/client-server-selection");
}
const { height } = useWindowSize();
</script>
<template>
  <SetupBackground/>

  <div class="flex w-screen">
    <div class="p-12 flex flex-col w-2/4 bg-black h-screen">
      <transition name="fade-up" appear>
        <div class="mx-auto w-[51rem] flex flex-col items-start space-y-8 mt-60">
          <div v-if="height > 650">
            <img :src="Logo" alt="APL Logo" class="w-24 h-24"/>
          </div>

          <h1 class="text-6xl font-semibold text-white leading-tight">
            The immersion tracking app<br/>
            that <span class="text-[#0FB4EC]">just works.</span>
          </h1>

          <Button
            @click="NextPage"
            class="w-[300px] p-3 !rounded-full self-start"
          >
            <span class="text-xl font-bold text-black">Get started!</span>
          </Button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-up-enter-active {
  transition: opacity 1s ease, transform 0.6s ease;
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
