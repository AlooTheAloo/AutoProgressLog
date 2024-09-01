<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";

const router = useRouter();

function GenerateReport(){
    window.ipcRenderer.invoke("GenerateReport").then((data) => {
        console.log(data);
    })
}

onMounted(() => {

})

</script>

<template>
    <div class="flex flex-col w-screen h-screen">
        <div class="flex flex-col flex-grow w-full h-full">
            <div class="flex flex-col flex-grow w-full h-full">
                <Button label="Generate Report" @click="GenerateReport"/>
            </div>
        </div>
    </div>
</template>