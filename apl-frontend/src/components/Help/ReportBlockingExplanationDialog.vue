<script setup lang="ts">
import TimelineLight from "../../assets/Graphics/Timeline_Light.png";
import TimelineDark from "../../assets/Graphics/Timeline_Dark.png";
import { useDialogComponent } from "../../util/DialogRenderer/composables/useDialogComponent";

const emits = defineEmits(useDialogComponent.emitsObject);
</script>

<template>
  <div
    class="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md space-y-4 text-gray-900 dark:text-gray-100 w-[45rem]"
  >
    <p>
      Let's say on <strong>Day 1</strong> you log <strong>20 minutes</strong> of
      immersion.
    </p>
    <p>
      At the end of Day 1, your report correctly shows
      <strong>20 total minutes</strong>.
    </p>
    <hr class="border-gray-200 dark:border-gray-700" />
    <p>Now on <strong>Day 2</strong>, you delete your Day 1 log.</p>
    <p>
      Without any safeguards, your Day 2 report would drop from 0 to
      <em>-20</em> minutes, which clearly doesn't make sense.
    </p>
    <hr class="border-gray-200 dark:border-gray-700" />
    <p>
      To prevent this paradox, APL simply <strong>ignores</strong> any edits or
      deletions made <em>before</em> your last report generation. That way, your
      totals always stay consistent.
    </p>
    <img :src="TimelineLight" class="dark:hidden block w-full" />
    <img :src="TimelineDark" class="dark:block hidden w-full" />
  </div>
</template>
