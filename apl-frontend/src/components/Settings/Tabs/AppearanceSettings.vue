<script setup lang="ts">
import SettingsToggle from "../Common/SettingsToggle.vue";
import { Options } from "../../../../apl-backend/types/options";
import SettingsFileUpload from "../Common/SettingsFileUpload.vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

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
      :value="config?.appearance.glow"
      label="Enable glow"
      help-text="Enables glow effects on the top left and bottom right corners of the app. Can cause slight performance dips."
      @update:value="
        $emit('update:config', {
          ...config,
          appearance: {
            ...config.appearance,
            glow: $event,
          },
        })
      "
    />
  </div>
</template>
