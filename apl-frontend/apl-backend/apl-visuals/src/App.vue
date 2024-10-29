
<script setup lang="ts">
import Report from './components/Report.vue';

</script>

<template>
  <Suspense>
    <Report/>
    
    <template #fallback>
      Loading...
    </template>
  </Suspense> 
</template>
