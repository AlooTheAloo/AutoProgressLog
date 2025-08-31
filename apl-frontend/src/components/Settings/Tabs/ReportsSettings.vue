<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { appPath } from "../../../pages/routes/appRoutes";
import SettingsField from "../Common/SettingsField.vue";
import {
  Options,
  ReportExtension,
  reportExtensions,
} from "../../../../apl-backend/types/options";
import SettingsSlider from "../Common/SettingsSlider.vue";
import SettingsList from "../Common/SettingsList.vue";
import SettingsPathPicker from "../Common/SettingsPathPicker.vue";

const props = defineProps<{
  config: Options | undefined;
}>();

const fileSizes = new Map<number, string>(
  [
    { quality: 1, size: "~170kB" },
    { quality: 2, size: "~450kB" },
    { quality: 3, size: "~800kB" },
    { quality: 4, size: "~1.3MB" },
    { quality: 5, size: "~1.8MB" },
  ].map(({ quality, size }) => [quality, size])
);

// type-based
const emit = defineEmits<{
  (e: "update:config", config: Options): void;
}>();

function updateFilename(value: string) {
  if (props.config?.localOptions?.outputOptions == undefined) return;
  emit("update:config", {
    ...props.config,
    localOptions: {
      ...props.config.localOptions,
      outputOptions: {
        ...props.config.localOptions.outputOptions,
        outputFile: {
          ...props.config.localOptions.outputOptions.outputFile,
          name: value,
        },
      },
    },
  });
}

function updateExtension(value: ReportExtension) {
  if (props.config?.localOptions?.outputOptions == undefined) return;
  emit("update:config", {
    ...props.config,
    localOptions: {
      ...props.config.localOptions,
      outputOptions: {
        ...props.config.localOptions.outputOptions,
        outputFile: {
          ...props.config.localOptions.outputOptions.outputFile,
          extension: value,
        },
      },
    },
  });
}

function updateFilepath(value: string) {
  if (props.config?.localOptions?.outputOptions == undefined) return;
  emit("update:config", {
    ...props.config,
    localOptions: {
      ...props.config.localOptions,
      outputOptions: {
        ...props.config.localOptions.outputOptions,
        outputFile: {
          ...props.config.localOptions.outputOptions.outputFile,
          path: value,
        },
      },
    },
  });
}

function updateQuality(value: number) {
  if (props.config?.localOptions?.outputOptions == undefined) return;
  emit("update:config", {
    ...props.config,
    localOptions: {
      ...props.config.localOptions,
      outputOptions: {
        ...props.config.localOptions.outputOptions,
        outputQuality: value,
      },
    },
  });
}
</script>

<template>
  <div class="flex flex-col w-full gap-6 pt-6" v-if="config != undefined">
    <SettingsField
      :value="config.localOptions.outputOptions.outputFile.name"
      label="Filename"
      placeholder="(e.g., myreport)."
      @update:value="updateFilename"
      help-text="The report file will be saved as this name followed by the report number."
    />

    <SettingsList
      :value="config.localOptions.outputOptions.outputFile.extension"
      label="File Extension"
      :options="reportExtensions"
      @update:value="updateExtension"
      help-text="The file extension of the report."
      placeholder="Select a file extension"
    >
    </SettingsList>

    <SettingsPathPicker
      :value="config.localOptions.outputOptions.outputFile.path"
      label="Filepath"
      @update:value="updateFilepath"
      help-text="The path to save the report to."
      folder
    >
    </SettingsPathPicker>

    <SettingsSlider
      :value="config.localOptions.outputOptions.outputQuality"
      label="Output Quality"
      help-text="The quality of the output image. Lower values will result in a smaller file size."
      :endText="fileSizes.get(config.localOptions.outputOptions.outputQuality)"
      :min="1"
      :max="5"
      @update:value="updateQuality"
    />
  </div>
</template>
