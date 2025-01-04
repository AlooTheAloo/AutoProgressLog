<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { appPath } from '../../../pages/routes/appRoutes';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import ToggleSwitch from 'primevue/toggleswitch';
import help from "../../../assets/Icons/help.png"

const props = defineProps<{
    label:string,
    value:boolean,
    password?:boolean,
    options?:any,
    disabled?:boolean,
    helpText?:string,
}>()

const emit = defineEmits(['update:value']);

function updateValue(value:boolean){
    emit("update:value", value);
}

const checked = ref<boolean>(props.value ?? false);

</script>

<template>
    <div class="flex items-center gap-10 w-full ">
        <div class="flex h-12 items-center gap-2">
            <p>
                {{ 
                    label
                }}    
            </p>
            <div class=" h-full w-4">
                <img v-if="props.helpText != undefined" v-tooltip.top="props.helpText" place :src="help" class="h-4 w-4 mt-2"/>
            </div>
        </div>
        <div class="flex ">

        </div>
        <ToggleSwitch
        v-on:update:model-value="updateValue"
        v-model="checked" />

    </div>
</template>