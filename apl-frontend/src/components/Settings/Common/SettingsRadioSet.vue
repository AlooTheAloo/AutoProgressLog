<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { appPath } from '../../../pages/routes/appRoutes';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import help from "../../../assets/Icons/help.png"
import RadioButton from 'primevue/radiobutton';
interface Option {
    key: string;
    name: string;
}

const props = defineProps<{
    label:string,
    value?:string,
    password?:boolean,
    options?:Option[],
    disabled?:boolean,
    placeholder?:string,
    helpText?:string,
    link?:string,
}>()

const emit = defineEmits(['update:value']);

function updateValue(value:any){
    console.log("Updating " + value);
    emit("update:value", value);
}

function openLink(){
    window.ipcRenderer.invoke('OpenExternal', props.link)
}

watch(props, () => {
    value.value = props.value ?? "";
})

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
                <img v-if="props.helpText != undefined" v-tooltip.top="props.helpText" place :src="help" 
                :class="`h-4 w-4 mt-2 ${props.link ? 'cursor-pointer' : ''}`"
                @click="props.link ? openLink() : undefined"
                />
            </div>
        </div>
        <div class="flex-grow  lg:gap-10">

            <div v-for="category in (props.options)" :key="category.key" class="flex items-center text-xl">
                <RadioButton v-model:model-value="value" :disabled="props.disabled" :inputId="category.key" name="dynamic" :value="category.key" @update:model-value="updateValue" />
                <label :for="category.key" class="ml-2 font-semibold px-1 text-lg ">{{ category.name }}</label>
            </div>


        </div>
        
    </div>
</template>