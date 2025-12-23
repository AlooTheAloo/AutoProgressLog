<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-vue-next";

const props = defineProps<{
  command: string;
  title?: string; // e.g. "Terminal"
}>();

const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command);
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 1200);
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl border bg-muted/40 px-4 py-3 shadow-sm min-w-0"
  >
    <div class="mb-2 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <div class="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <div class="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <span class="ml-2 text-xs font-medium text-muted-foreground">
          {{ props.title ?? "Terminal" }}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        @click="copy"
        :aria-label="copied ? 'Copied' : 'Copy command'"
      >
        <Check v-if="copied" class="h-4 w-4" />
        <Copy v-else class="h-4 w-4" />
      </Button>
    </div>

    <pre
      class="max-w-full overflow-x-auto rounded-lg bg-background/60 p-3 text-sm leading-relaxed"
    ><code class="font-mono text-foreground">sudo {{ props.command.startsWith("sudo ") ? props.command.slice(5) : props.command }}</code></pre>

    <div
      v-if="copied"
      class="pointer-events-none absolute right-3 top-11 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground shadow"
    >
      Copied!
    </div>
  </div>
</template>
