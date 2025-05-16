<script setup lang="ts">
import DatePicker from "primevue/datepicker";
import { Options } from "../../../../apl-backend/types/options";
import SettingsToggle from "../Common/SettingsToggle.vue";
import help from "../../../assets/Icons/help.png";
import { ref } from "vue";
import { watch } from "vue";
import SettingsDatePicker from "../Common/SettingsDatePicker.vue";
import SettingsResetSettings from "../Common/SettingsResetSettings.vue";

const props = defineProps<{
  config: Options | undefined;
}>();

// type-based
const emit = defineEmits<{
  (e: "update:config", config: Options): void;
}>();

const selectedTime = ref<Date | undefined>();

watch(props, () => {
  const time = props.config?.general.autogen.options?.generationTime;
  if (time == undefined) return;
  const date = new Date();
  date.setHours(time.hours);
  date.setMinutes(time.minutes);
  console.log(date);
  selectedTime.value = date;
  console.log(selectedTime.value);
});

function updateTime(value: Date) {
  if (props.config == undefined) return;
  emit(
    "update:config",
    !props.config.general.autogen.enabled
      ? {
          ...props.config,
          general: {
            ...props.config.general,
            autogen: {
              enabled: false,
            },
          },
        }
      : {
          ...props.config,
          general: {
            ...props.config?.general,
            autogen: {
              enabled: props.config?.general.autogen.enabled,
              options: {
                ...props.config?.general.autogen.options,
                generationTime: {
                  hours: value.getHours(),
                  minutes: value.getMinutes(),
                },
              },
            },
          },
        }
  );
}

function ToggleAutogen(value: boolean) {
  if (props.config == undefined) return;
  emit("update:config", {
    ...props.config,
    general: {
      ...props.config.general,
      autogen: value
        ? {
            enabled: true,
            options: {
              generationTime: {
                hours: 0,
                minutes: 0,
              },
            },
          }
        : {
            enabled: false,
          },
    },
  });
}
</script>

<template>
  <div class="flex flex-col w-full gap-2" v-if="config != undefined">
    <SettingsToggle
      :value="config.general.autogen.enabled"
      label="Automatic Report Generation"
      help-text="Automatically generate reports at a predetermined time interval. If your computer is turned off or disconnected from the internet, the reports will not be generated."
      @update:value="ToggleAutogen($event)"
    />

    <SettingsDatePicker
      :value="selectedTime"
      label="Time to Generate Reports"
      @update:value="updateTime"
      :disabled="!props.config?.general.autogen.enabled"
      help-text="The time at which reports will be generated every day"
    />

    <SettingsToggle
      :value="config.general.discordIntegration"
      label="Enable Discord RPC"
      help-text="This will enable the Discord Rich Presence. When immersing, the app will show your current immersion time and immersion activity in the discord status."
      @update:value="
        $emit('update:config', {
          ...config,
          general: { ...config.general, discordIntegration: $event },
        })
      "
    />

    <SettingsResetSettings
      label="Reset application settings"
      help-text="CAUTION! This will reset the entire application data, any data WILL be erased and WILL NOT be recoverable."
    />
  </div>
</template>
