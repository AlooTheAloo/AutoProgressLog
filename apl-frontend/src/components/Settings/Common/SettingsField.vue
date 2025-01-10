<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { appPath } from '../../../pages/routes/appRoutes';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import help from "../../../assets/Icons/help.png"

const props = defineProps<{
    label:string,
    value?:string,
    password?:boolean,
    options?:any,
    disabled?:boolean,
    placeholder?:string,
    helpText?:string,
}>()

const emit = defineEmits(['update:value']);

function updateValue(value:any){
    emit("update:value", value);
}

const value = ref<string>(props.value ?? "");

</script>

<template>
    <div class="flex items-center gap-10 w-full h-12 ">
        <div class="flex h-full items-center gap-2 w-64">
            <p>
                {{ 
                    label
                }}    
            </p>
            <div class=" h-full w-4">
                <img v-if="props.helpText != undefined" v-tooltip.top="props.helpText" place :src="help" class="h-4 w-4 mt-2"/>
            </div>
        </div>
        <InputText v-if="!password" 
        :disabled="disabled" 
        @update:model-value="updateValue" 
        v-model="value" type="text" 
        size="large" 
        :placeholder="placeholder" 
        fluid 
        class="mx-5" />

        <Password v-else 
        v-model="value" 
        :disabled="disabled"
        @update:model-value="updateValue" 
        size="large" 
        :placeholder="placeholder" 
        fluid 
        class="mx-5" />
    </div>
</template>