<script setup lang="ts">
import DatePicker from "primevue/datepicker";
import { Options } from "../../../../apl-backend/types/options";
import SettingsToggle from "../Common/SettingsToggle.vue";
import help from "../../../assets/Icons/help.png";
import { onMounted, ref } from "vue";
import { watch } from "vue";
import SettingsDatePicker from "../Common/SettingsDatePicker.vue";
import SettingsResetSettings from "../Common/SettingsResetSettings.vue";
import dayjs from "dayjs";

const timezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Toronto";

const props = defineProps<{
  config: Options | undefined;
}>();

// type-based
const emit = defineEmits<{
  (e: "update:config", config: Options): void;
}>();

const selectedTime = ref<Date | undefined>();

onMounted(() => {
  console.log("props", props);
});

watch(
  props,
  () => {
    console.log("in watch");
    const m_time = props.config?.serverOptions.userOptions.autoGenTime;
    console.log("time", m_time);

    if (!m_time || typeof m_time.secondsSinceMidnight !== "number") return;

    // Create a new Date for today
    const date = new Date();

    // Calculate hours, minutes, seconds from secondsSinceMidnight
    const totalSeconds = m_time.secondsSinceMidnight;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Apply to current date
    date.setHours(hours, minutes, seconds, 0);

    console.log("Converted time:", { hours, minutes, seconds });
    console.log("Date object:", date);
    selectedTime.value = date;
    console.log("selectedTime:", selectedTime.value);
  },
  {
    immediate: true,
  }
);

function updateTime(value: Date | null) {
  if (props.config == undefined) return;
  console.log("Autogentime : " + value);
  const valueAsConfig =
    value == null
      ? null
      : {
          secondsSinceMidnight: Math.floor(
            value.getHours() * 3600 +
              value.getMinutes() * 60 +
              value.getSeconds()
          ),
          timezone: timezone(),
        };
  emit("update:config", {
    ...props.config,
    serverOptions: {
      ...props.config.serverOptions,
      userOptions: {
        ...props.config.serverOptions.userOptions,
        autoGenTime: valueAsConfig,
      },
    },
  });
}

function ToggleAutogen(value: boolean) {
  if (props.config == undefined) return;
  emit("update:config", {
    ...props.config,
    serverOptions: {
      ...props.config.serverOptions,
      userOptions: {
        ...props.config.serverOptions.userOptions,
        autoGenTime: value
          ? { secondsSinceMidnight: 0, timezone: timezone() }
          : null,
      },
    },
  });
}
</script>

<template>
  <div class="flex flex-col w-full gap-6 pt-6" v-if="config != undefined">
    <SettingsToggle
      :value="config.serverOptions.userOptions.autoGenTime != null"
      label="Automatic Report Generation"
      help-text="Automatically generate reports at a predetermined time interval. If your computer is turned off or disconnected from the internet, the reports will not be generated."
      @update:value="ToggleAutogen($event)"
    />

    <SettingsDatePicker
      :model-value="selectedTime"
      label="Time to Generate Reports"
      @update:model-value="updateTime"
      :disabled="config.serverOptions.userOptions.autoGenTime == null"
      help-text="The time at which reports will be generated every day"
    />

    <SettingsToggle
      :value="config.localOptions.general.discordIntegration"
      label="Enable Discord RPC"
      help-text="This will enable the Discord Rich Presence. When immersing, the app will show your current immersion time and immersion activity in the discord status."
      @update:value="
        $emit('update:config', {
          ...config,
          localOptions: {
            ...config.localOptions,
            general: {
              ...config.localOptions.general,
              discordIntegration: $event,
            },
          },
        })
      "
    />

    <SettingsResetSettings
      label="Reset all application data"
      help-text="CAUTION! This will reset the entire application data, any data WILL be erased and WILL NOT be recoverable."
    />
  </div>
</template>
