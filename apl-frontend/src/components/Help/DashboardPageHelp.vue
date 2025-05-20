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
  router.push(path);
};
const openExplanation = () => {
  $dialog({
    component: ReportBlockingExplanationDialog,
  });
};
</script>

<template>
  <div class="flex flex-col min-w-full h-full flex-grow mt-10">
    <Accordion :value="[]" multiple fluid class="w-full">
      <AccordionPanel value="0">
        <AccordionHeader class="w-full">Generating a report</AccordionHeader>
        <AccordionContent>
          <div
            class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100"
          >
            <p>
              Reports are one of APL's core features. They let you monitor your
              progress and visualize how you're improving over time.
            </p>
            <p>To generate a report:</p>
            <ol class="list-decimal list-inside space-y-2">
              <li class="questionButton">
                Click the <strong>Generate Report</strong> button in the
                top-right of the
                <Button
                  class="h-2"
                  text
                  variant="link"
                  severity="info"
                  @click="
                    () => {
                      navigateTo('/app/dashboard');
                    }
                  "
                >
                  dashboard page
                </Button>
              </li>
              <li>
                APL will gather all data entered
                <em>since your last report</em> and compile it into a new
                report.
              </li>
              <li>
                Any entries you add <strong>before</strong> the report is
                generated won't be included retroactively.
              </li>
            </ol>
            <div class="questionButton">
              <Button
                class="h-2"
                text
                variant="link"
                severity="info"
                @click="openExplanation"
              >
                What the heck does that mean?
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="1">
        <AccordionHeader> Scheduling a report </AccordionHeader>
        <AccordionContent>
          <div
            class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100"
          >
            <p>
              Most users prefer a <strong>daily report</strong>. You can set
              this up in your <strong>Settings → Reports</strong> page.
            </p>
            <ul class="list-disc list-inside space-y-2">
              <li>Toggle on <strong>Automatic Daily Reports</strong>.</li>
              <li>
                Choose the exact time you'd like APL to generate your report
                each day.
              </li>
              <li>
                Note: If your computer is turned off, suspended, or offline at
                that time, APL won't be able to run the report.
              </li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionPanel>
      <AccordionPanel value="2">
        <AccordionHeader>Very important info !!!!!!</AccordionHeader>
        <AccordionContent>
          <p class="m-0">caca</p>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<style>
.questionButton > .p-button {
  padding-left: 0rem !important;
  padding-right: 0rem !important;
}
</style>
