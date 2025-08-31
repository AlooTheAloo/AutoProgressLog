<script setup lang="ts">
import Accordion from "primevue/accordion";
import AccordionContent from "primevue/accordioncontent";
import AccordionHeader from "primevue/accordionheader";
import AccordionPanel from "primevue/accordionpanel";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDialog } from "../../util/DialogRenderer/composables/useDialog";
import ReportBlockingExplanationDialog from "./ReportBlockingExplanationDialog.vue";

const router = useRouter();
const $dialog = useDialog();

const navigateTo = (path: string) => {
  console.log("Navigating to", path);
  router.push(path);
};
const openExplanation = () => {
  $dialog({
    component: ReportBlockingExplanationDialog,
  });
};
</script>

<template>
  <div class="flex flex-col min-w-full flex-grow mt-10 accordion">
    <Accordion :value="[]" multiple fluid class="w-full">
      <AccordionPanel value="0">
        <AccordionHeader class="w-full">Connecting to Anki</AccordionHeader>
        <AccordionContent>
          <div
            class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100"
          >
            <p>To link your APL and Anki accounts:</p>

            <ol class="list-decimal list-inside space-y-2">
              <li class="linkButton">
                Open the
                <Button
                  class="h-2"
                  text
                  variant="link"
                  severity="info"
                  @click="
                    () => {
                      navigateTo('/app/settings');
                    }
                  "
                >
                  settings page
                </Button>

                and navigate to the <strong>Anki</strong> tab.
              </li>
              <li>Turn on the <strong>Synchronize Anki</strong> switch.</li>
              <li>
                If you use a self-hosted Anki server, paste its URL in the “Anki
                Backend URL” field.
              </li>
              <li>
                Provide your Anki <strong>host key</strong> so APL can
                authenticate.
              </li>
              <li>Click the <strong>Test Connection</strong> button.</li>
            </ol>

            <p class="m-0">
              Once verified, APL will synchronize with your Anki database. This
              initial sync may take a few minutes, feel free to grab a coffee!
            </p>
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionHeader> Finding your anki host key </AccordionHeader>
        <AccordionContent>
          <div
            class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100"
          >
            <p>
              Locating your Anki host key can be tricky. APL streamlines the
              process, just follow these steps:
            </p>

            <ol class="list-decimal list-inside space-y-2">
              <li class="linkButton">
                Go to the
                <Button
                  class="h-2 inline-block"
                  text
                  variant="link"
                  severity="info"
                  @click="
                    () => {
                      navigateTo('/app/settings');
                    }
                  "
                >
                  Settings page
                </Button>
                and select the <strong>Anki</strong> tab.
              </li>
              <li>Click the <strong>Easy Anki Setup</strong> button.</li>
              <li>
                Enter your Anki Web <strong>username</strong> &#38;
                <strong>password</strong>.
              </li>
              <li>APL will fetch and store your host key automatically.</li>
            </ol>

            <p class="m-0">
              This initial setup may take a few minutes, thanks for your
              patience!
            </p>
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="2">
        <AccordionHeader>
          Determining your retention algorithm
        </AccordionHeader>
        <AccordionContent>
          <div
            class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100"
          >
            <p>APL offers two ways to calculate retention:</p>

            <ul class="list-disc list-inside space-y-2">
              <li>
                <strong>True Retention:</strong>
                The most accurate measure of how well you've remembered items.
                <br />
                <em>Note:</em> This won't match the retention numbers shown in
                Anki's built-in stats.
              </li>
              <li>
                <strong>Default Anki:</strong>
                The familiar algorithm used by Anki by default. It's slightly
                less precise, but aligns with the values you see in your Anki
                statistics.
              </li>
            </ul>

            <p class="mt-4">
              <strong>Unsure which one to pick?</strong>
              We recommend <strong>True Retention</strong> for its accuracy.
            </p>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style>
.linkButton > .p-button {
  padding-left: 0rem !important;
  padding-right: 0rem !important;
}

.accordion > .p-accordion {
  height: 0px;
}
</style>
