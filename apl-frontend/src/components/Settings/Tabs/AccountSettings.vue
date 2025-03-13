<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { appPath } from "../../../pages/routes/appRoutes";
import SettingsField from "../Common/SettingsField.vue";
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
    <SettingsField
      :value="config?.account?.userName"
      label="Username"
      placeholder="Enter your username"
      @update:value="
        $emit('update:config', {
          ...config,
          account: { ...config.account, userName: $event },
        })
      "
    />
  </div>
</template>
