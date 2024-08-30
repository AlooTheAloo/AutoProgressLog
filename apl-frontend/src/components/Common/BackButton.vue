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
    <div class="w-fit ">
        <Button style="padding: 7px 0px 7px 0px;" label="Go back" link="" icon="pi-angle-left pi" @click="Back" class="p-0 h-12"/>
    </div>
</template>