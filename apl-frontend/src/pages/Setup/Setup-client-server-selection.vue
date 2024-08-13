<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';

    const router = useRouter()
    function SelectClient(){

    }

    function SelectServer(){    

    }
</script>

<template>
    <div class="w-screen h-screen p-12 flex flex-col justify-between items-start">
        <h2 class=" text-3xl font-extrabold w-full text-left">
            First step pookie - Is this a client or a server :3
        </h2>
        <div class="flex items-start gap-4">
            <button class="w-fit font-extrabold" onclick="SelectClient">
                Client
            </button>
            <button class="w-fit font-extrabold" onclick="SelectServer">
                Server
            </button>
        </div>
        
    </div>
</template>