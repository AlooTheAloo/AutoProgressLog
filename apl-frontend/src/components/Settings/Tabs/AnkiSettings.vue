<script setup lang="ts">
import { Options, RetentionMode } from "../../../../apl-backend/types/options";
import { ref } from "vue";
import { watch } from "vue";
import SettingsToggle from "../Common/SettingsToggle.vue";
import { WarningProps } from "../../../../types/Warning";
import SettingsPathPicker from "../Common/SettingsPathPicker.vue";
import SettingsField from "../Common/SettingsField.vue";
import Button from "primevue/button";
import SettingsRadioSet from "../Common/SettingsRadioSet.vue";
import { deck } from "../../../../apl-backend/config/configAnkiIntegration";
import MultiSelect from "primevue/multiselect";
import SettingsMultiSelect from "../Common/SettingsMultiSelect.vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";

interface algorithm {
  key: string;
  name: string;
}

const props = defineProps<{
  config: Options | undefined;
}>();

const retentionAlgorithms: algorithm[] = [
  { key: "true_retention", name: "TrueRetention (recommended)" },
  { key: "default_anki", name: "Default Anki Retention" },
];

const emit = defineEmits<{
  (e: "update:config", config: Options): void;
  (e: "danger", config: WarningProps | undefined): void;
  (e: "ankitest:worked", worked: boolean): void;
}>();

window.ipcRenderer.on("anki-connect-message", (sender, m: any) => {
  message.value = m;
});

const testing_connection = ref<boolean>(false);
const message = ref<string>("");

const ankiTestPassed = ref<boolean>(false);
const canTest = ref<boolean>(true);

const decks = ref<deck[]>([]);
const selectedDecks = ref<number[]>([]);

const easyAnkiVisible = ref<boolean>(false);
const easy_username = ref<string>("");
const easy_password = ref<string>("");
const easy_url = ref<string>("https://sync.ankiweb.net");

function updateTrackedDecks(value: number[]) {
  if (props.config?.anki?.options == undefined) return;
  emit("update:config", {
    ...props.config,
    anki: {
      ...props.config.anki,
      options: { ...props.config.anki.options, trackedDecks: value },
    },
  });
}

function updateRetentionAlgorithm(value: RetentionMode) {
  if (props.config?.anki?.options == undefined) return;
  emit("update:config", {
    ...props.config,
    anki: {
      ...props.config.anki,
      options: { ...props.config.anki.options, retentionMode: value },
    },
  });
}

function testKey() {
  if (props.config?.anki.ankiIntegration == undefined) return;
  testing_connection.value = true;
  window.ipcRenderer
    .invoke(
      "test-anki-connection-key",
      props.config.anki.ankiIntegration.key,
      props.config.anki.ankiIntegration.url
    )
    .then((retVal: { worked: boolean; decks: deck[]; key: string }) => {
      console.log("received " + JSON.stringify(retVal));
      if (props.config?.anki.ankiIntegration == undefined) return;
      ankiTestPassed.value = retVal.worked;
      canTest.value = true;
      if (retVal.worked) {
        setKey(retVal.key, props.config.anki.ankiIntegration.url);
        decks.value = retVal.decks;
        selectedDecks.value = props.config?.anki?.options?.trackedDecks ?? [];
      }
      testing_connection.value = false;
      emit("ankitest:worked", retVal.worked);
    });
}

function setKey(key: string, url: string) {
  if (props.config == undefined) return;
  emit("update:config", {
    ...props.config,
    anki: {
      enabled: true,
      ankiIntegration: {
        key: key,
        url: url,
      },
      options: props.config?.anki.options ?? {
        retentionMode: "true_retention",
        trackedDecks: [],
      },
    },
  });
}

function testConnection() {
  if (props.config == undefined) return;
  testing_connection.value = true;
  window.ipcRenderer
    .invoke("test-anki-connection", {
      username: easy_username.value,
      password: easy_password.value,
      url: easy_url.value,
    })
    .then((retVal: { worked: boolean; decks: deck[]; key: string }) => {
      if (props.config == undefined) return;
      ankiTestPassed.value = retVal.worked;
      canTest.value = true;
      if (retVal.worked) {
        decks.value = retVal.decks;
        selectedDecks.value = props.config?.anki?.options?.trackedDecks ?? [];
        easyAnkiVisible.value = false;
        setKey(retVal.key, easy_url.value);
      }
      testing_connection.value = false;
      emit("ankitest:worked", retVal.worked);
    });
}

function updateAnkiHostKey(value: string) {
  if (props.config == undefined) return;
  emit("update:config", {
    ...props.config,
    anki: {
      ...props.config.anki,
      ankiIntegration:
        props.config.anki.ankiIntegration == undefined
          ? undefined
          : { ...props.config.anki.ankiIntegration, key: value },
    },
  });
}

function updateAnki(value: boolean) {
  if (props.config == undefined) return;
  const savedConfig = props.config;
  emit("update:config", { ...props.config, anki: { enabled: false } });
  if (!value) {
    emit("danger", {
      title: "Are you sure?",
      content:
        "This is a destructive operation. Disabling Anki Sync will remove all data from the APL anki databse. <br> You will lose your streak, mature cards and retention data.",
      yesText: "Yes",
      noText: "No",
      onYes: () => {
        if (props.config == undefined) return;
        emit("danger", undefined);
      },
      onNo: () => {
        if (props.config == undefined) return;
        emit("danger", undefined);
        emit("update:config", { ...props.config, anki: { enabled: false } });
        emit("update:config", savedConfig);
      },
    });
  } else {
    emit("update:config", {
      ...props.config,
      anki: {
        enabled: true,
        ankiIntegration: props.config.anki.ankiIntegration ?? {
          key: "",
          url: "https://sync.ankiweb.net",
        },
        options: props.config.anki.options ?? {
          retentionMode: "true_retention",
          trackedDecks: [],
        },
      },
    });
  }
}
</script>

<template>
  <!-- Easy anki setup dialog -->
  <Dialog
    v-model:visible="easyAnkiVisible"
    modal
    header="Easy anki setup"
    :style="{ width: '30rem' }"
    :closeOnEscape="false"
    :closable="!testing_connection"
  >
    <div v-if="!testing_connection">
      <span class="text-surface-500 dark:text-surface-400 block mb-8">
        Enter your anki username and password.
      </span>
      <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Username</label>
        <InputText
          v-model="easy_username"
          id="username"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">Password</label>

        <Password
          v-model="easy_password"
          toggle-mask
          id="password"
          class="flex-auto"
          autocomplete="off"
          fluid
          :feedback="false"
        />
      </div>
      <Accordion value="-1">
        <AccordionPanel value="0">
          <AccordionHeader>Advanced Settings</AccordionHeader>
          <AccordionContent>
            <div class="flex items-center gap-4">
              <label for="email" class="font-semibold w-fit"
                >Anki Sync URL</label
              >
              <InputText
                class="flex-auto"
                autocomplete="off"
                v-model="easy_url"
              />
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <div class="flex justify-end gap-2 mt-5">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="easyAnkiVisible = false"
        ></Button>
        <Button
          type="button"
          label="Test And Save"
          @click="testConnection"
        ></Button>
      </div>
    </div>
    <div
      class="flex flex-col gap-2 items-center justify-center text-xl font-bold"
      v-else
    >
      <ProgressSpinner />
      {{ message }}
    </div>
  </Dialog>

  <div class="flex flex-col w-full gap-5 flex-grow" v-if="config != undefined">
    <div class="flex items-center h-12 gap-3">
      <h1 class="text-2xl font-bold text-white">Connection settings</h1>
      <Button
        class="w-fit h-10"
        v-on:click="easyAnkiVisible = true"
        :loading="testing_connection"
      >
        Easy anki setup
      </Button>
    </div>

    <SettingsToggle
      :value="config.anki.enabled"
      label="Synchronize Anki"
      help-text="When enabled, synchronizes and updates your Anki retention rate, mature cards and reviews with APL."
      @update:value="updateAnki"
      :disabled="testing_connection"
    />

    <SettingsField
      :value="props.config?.anki.ankiIntegration?.key"
      label="Anki Host Key"
      help-text="Your Anki API key can be generated using the easy anki setup button above."
      @update:value="updateAnkiHostKey"
      password
      :disabled="testing_connection"
    >
    </SettingsField>

    <SettingsField
      :value="props.config?.anki.ankiIntegration?.url"
      label="Anki Backend URL"
      help-text="If you are using a self-hosted Anki backend, you can enter the URL here. Do not include the trailing slash."
      :disabled="testing_connection"
    >
    </SettingsField>

    <div class="flex items-center h-12 gap-3">
      <h1 class="text-2xl font-bold text-white">Synchronization settings</h1>
      <Button
        class="w-fit h-10"
        v-on:click="testKey"
        :loading="testing_connection"
      >
        Test key
      </Button>
    </div>
    <div class="flex flex-col w-full gap-5 flex-grow">
      <SettingsRadioSet
        :disabled="!ankiTestPassed || testing_connection"
        :value="config.anki.options?.retentionMode"
        label="Retention Algorithm"
        help-text="The algorithm to use for retention calculations. The default is TrueRetention, which is the recommended algorithm."
        @update:value="updateRetentionAlgorithm"
        :options="retentionAlgorithms"
        :v-tooltip="!ankiTestPassed ? 'Test connection to enable' : ''"
      />

      <SettingsMultiSelect
        label="Tracked Decks"
        help-text="The decks you would like to track. You can select multiple decks if you'd like."
        :value="selectedDecks"
        :options="decks"
        :disabled="!ankiTestPassed || testing_connection"
        v-on:update:value="updateTrackedDecks"
      >
      </SettingsMultiSelect>
    </div>
  </div>
</template>
