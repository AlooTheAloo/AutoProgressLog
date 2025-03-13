<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TogglAccount } from "../../../types/TogglAccount";
import Logo from "../../assets/Logo.png";

const account = ref<TogglAccount | undefined>(undefined);

onMounted(async () => {
  account.value = await window.ipcRenderer.invoke("toggl-account-get");
});
</script>
<template>
  <div class="flex gap-5 items-center justify-between">
    <img :src="Logo" class="w-12 h-12" />
    <div
      class="flex gap-2 items-center justify-center"
      v-if="account !== undefined"
    >
      <img
        :alt="account?.name"
        v-bind:src="account?.pfp_url"
        class="h-8 w-8 rounded-md min-w-8"
      />
      <div class="font-semibold flex items-center text-md truncate min-w-0">
        {{ account?.name }}
      </div>
    </div>
  </div>
</template>
