<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { appPath } from "../../../pages/routes/appRoutes";
import SettingsField from "../Common/SettingsField.vue";
import { Options } from "../../../../apl-backend/types/options";
import SettingsFileUpload from "../Common/SettingsFileUpload.vue";
import Toast from "primevue/toast";
defineProps<{
  config: Options | undefined;
}>();

// type-based
const emit = defineEmits<{
  (e: "update:config", config: Options): void;
}>();
</script>

<template>
  <div class="flex flex-col w-full gap-6 pt-6" v-if="config != undefined">
    <SettingsField
      :value="config.serverOptions.userProfile.userName ?? undefined"
      label="Username"
      placeholder="Enter your username (max 100 characters)"
      :max-length="100"
      @update:value="
        $emit('update:config', {
          ...config,
          serverOptions: {
            ...config.serverOptions,
            userProfile: {
              ...config.serverOptions.userProfile,
              userName: $event,
            },
          },
        })
      "
    />

    <SettingsField
      :value="config.serverOptions.userProfile.email"
      label="Email"
      placeholder="Enter your email"
      @update:value="
        $emit('update:config', {
          ...config,
          serverOptions: {
            ...config.serverOptions,
            userProfile: {
              ...config.serverOptions.userProfile,
              email: $event,
            },
          },
        })
      "
    />

    <SettingsFileUpload
      label="Profile picture"
      help-text="Changes the profile picture in the app. This will automatically be uploaded and applied."
      @update:pfp=""
    />
  </div>
</template>
