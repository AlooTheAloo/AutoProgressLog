<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import ProgressSpinner from "primevue/progressspinner";
import { useRouter } from "vue-router";

const router = useRouter();
function Return() {
  router.push("/setup/client-server-selection");
}
</script>

<template>
  <SetupBackground></SetupBackground>

  <div class="p-12 flex flex-col w-2/3 bg-black h-screen">
    <div>
      <img :src="Logo" class="w-12 h-12" />
    </div>
    <div class="flex flex-col flex-grow pt-5 justify-start gap-2 text-left">
      <div class="font-semibold text-3xl text-white">
        There was an error while linking your Toggl account...
      </div>

      <div class="flex-grow text-sm">
        Please try again. If this issue persists, please open an issue on
        GitHub.
      </div>

      <div class="flex items-end justify-end">
        <div>
          <Button @click="Return" style="width: 120px" label="Try again i" />
        </div>
      </div>
    </div>
  </div>
</template>
