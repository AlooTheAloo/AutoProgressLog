<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

    const router = useRouter()
    const route = useRoute()

    function goPage2() {
        router.push("/page2")
    }
</script>

<template>
  <div>
    <h1>Page 1</h1>
    <button @click="goPage2">Go to Page 2</button>
</div>
</template>