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
    if (m_time == undefined || m_time == null) return;
    console.log("time", m_time);
    const time = dayjs(m_time);
    const date = new Date();
    date.setHours(time.hour());
    date.setMinutes(time.minute());
    console.log("date", date.toDateString());
    console.log(date);
    selectedTime.value = date;
    console.log(selectedTime.value);
  },
  {
    immediate: true,
  }
);

function updateTime(value: Date) {
  if (props.config == undefined) return;
  emit(
    "update:config",
    props.config.serverOptions.userOptions.autoGenTime == null
      ? {
          ...props.config,
          serverOptions: {
            ...props.config.serverOptions,
            userOptions: {
              ...props.config.serverOptions.userOptions,
              autoGenTime: value,
            },
          },
        }
      : {
          ...props.config,
          serverOptions: {
            ...props.config.serverOptions,
            userOptions: {
              ...props.config.serverOptions.userOptions,
              autoGenTime: value,
            },
          },
        }
  );
}

function ToggleAutogen(value: boolean) {
  if (props.config == undefined) return;
  emit("update:config", {
    ...props.config,
    serverOptions: {
      ...props.config.serverOptions,
      userOptions: {
        ...props.config.serverOptions.userOptions,
        autoGenTime: value ? dayjs().startOf("day").toDate() : null,
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
      :value="selectedTime"
      label="Time to Generate Reports"
      @update:value="updateTime"
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
