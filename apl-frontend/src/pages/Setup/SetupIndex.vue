<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';

    const router = useRouter()
    function NextPage(){
        router.push('/setup/client-server-selection')
    }
</script>

<template>
    <div class="w-screen h-screen p-12 flex flex-col justify-between items-start">
        <h2 class=" text-3xl font-extrabold w-full text-left">
            Get started using AutoProgressLog
        </h2>
        <button class="w-fit font-extrabold" :onclick="NextPage()">
            Start :3
        </button>
    </div>
</template>