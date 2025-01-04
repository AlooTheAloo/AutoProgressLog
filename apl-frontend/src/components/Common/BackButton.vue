<script setup lang="ts">
    import Button from 'primevue/button';
    import { useRouter } from 'vue-router';
    const router = useRouter()

    function Back(){
        if(props.route === "back"){
            router.back();
        }
        else router.push(props.route);
    }

    const props = defineProps<{
        route: string
    }>()

</script>

<template>
    <div class="w-fit h-8 ">
        <Button link style="padding: 0;" label="Go back" icon="pi-angle-left pi" @click="Back" class="p-0 h-8"/>
    </div>
</template>