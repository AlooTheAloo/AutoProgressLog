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
      :password="true"
      :value="config?.toggl.togglToken"
      label="Toggl Token"
      placeholder="Enter your toggl track api key"
      @update:value="
        $emit('update:config', {
          ...config,
          toggl: { ...config.toggl, togglToken: $event },
        })
      "
      link="https://toggl.com/app/profile"
      help-text="You can find your toggl token by going to the bottom of your profile page. Click to open it in a browser."
    />
  </div>
</template>
