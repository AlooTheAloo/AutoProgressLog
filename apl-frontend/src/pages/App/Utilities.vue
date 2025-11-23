<script setup lang="ts">
import { Button } from "primevue";
import Dialog from "primevue/dialog";
import { ref } from "vue";
import CardDeduplicatorPanel from "../Utilities/CardDeduplicatorPanel.vue";

const cardDedulicatorVisible = ref(false);
</script>

<template>
  <Dialog
    modal
    header="Card deduplicator"
    v-model:visible="cardDedulicatorVisible"
  >
    <CardDeduplicatorPanel />
  </Dialog>
  <Button @click="cardDedulicatorVisible = true"></Button>
</template>
