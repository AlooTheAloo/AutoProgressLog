<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import Password from "primevue/password";
import { useRouter } from "vue-router";

const apiKey = defineModel<string>("");

const router = useRouter();
function OpenTogglTrackPage() {
  window.ipcRenderer.invoke("OpenExternal", "https://track.toggl.com/profile");
}

function CreateAccount() {
  window.ipcRenderer.invoke(
    "OpenExternal",
    "https://accounts.toggl.com/track/signup/"
  );
}

async function NextPage() {
  await window.ipcRenderer.invoke("toggl-api-key-set", apiKey.value);
  router.push("/setup/toggl-success");
}
</script>

<template>
  <SetupBackground></SetupBackground>
  <div class="flex w-screen">
    <div class="p-12 flex flex-col w-2/3 bg-black h-screen">
      <div>
        <img :src="Logo" class="w-12 h-12" />
      </div>
      <div class="flex flex-col flex-grow pt-5 justify-start gap-2 text-left">
        <BackButton route="/setup/client-server-selection" />
        <div class="font-semibold text-3xl text-white">
          Connect to your Toggl Track account
        </div>
        <div class="text-sm">
          Please enter your Toggl Track API Token. This key can be found at the
          bottom of your profile settings page.
          <br />
          If you don't have an account, you can create one
          <Button
            link
            style="padding: 0"
            label="here"
            @click="CreateAccount"
            class="p-0 h-8"
          />
        </div>
        <div class="my-3">
          <Button
            @click="OpenTogglTrackPage"
            icon="pi-external-link pi"
            label="Open toggl track profile page"
          />
        </div>

        <div>
          <div class="text-lg mb-2 text-white">API Token</div>
          <Password
            v-model="apiKey"
            fluid
            :feedback="false"
            placeholder="Enter your API token here"
          />
        </div>

        <div class="flex flex-grow items-end justify-end">
          <div>
            <Button
              @click="NextPage"
              style="width: 120px"
              label="Continue"
              v-bind:disabled="(apiKey ?? '').length != 32"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
