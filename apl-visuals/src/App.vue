
<script setup lang="ts">
  import Report from './components/Report.vue'


</script>

<template>
  <Suspense>
    <report></report>

    <template #fallback>
      Loading...
    </template>
  </Suspense>
  
</template>
