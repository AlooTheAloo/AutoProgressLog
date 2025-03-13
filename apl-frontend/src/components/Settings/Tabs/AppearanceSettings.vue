<script setup lang="ts">
import SettingsToggle from "../Common/SettingsToggle.vue";
import { Options } from "../../../../apl-backend/types/options";

defineProps<{
  config: Options | undefined;
}>();

// type-based
const emit = defineEmits<{
  (e: "update:config", config: Options): void;
}>();
</script>

<template>
  <div class="flex flex-col w-full gap-2" v-if="config != undefined">
    <SettingsToggle
      :value="config?.appreance.glow"
      label="Enable glow"
      help-text="Enables glow effects on the top left and bottom right corners of the app. Can cause slight performance dips."
      @update:value="
        $emit('update:config', {
          ...config,
          account: { ...config.account, userName: $event },
        })
      "
    />
  </div>
</template>
