<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { appPath } from '../../../pages/routes/appRoutes';
import SettingsField from '../Common/SettingsField.vue';
import { Options, ReportExtension, reportExtensions } from '../../../../apl-backend/types/options';
import SettingsPathPicker from '../Common/SettingsPathPicker.vue';
import SettingsSlider from '../Common/SettingsSlider.vue';
import SettingsList from '../Common/SettingsList.vue';

const props = defineProps<{
    config:Options|undefined
}>()

const fileSizes = [
    {
        quality: 1,
        size: "~170kB",
    }
    ,
    {
        quality: 2,
        size: "~450kB",
    }
    ,
    {
        quality: 3,
        size: "~800MB",
    }
    ,
    {
        quality: 4,
        size: "~1.3MB",
    }
    ,
    {
        quality: 5,
        size: "~1.8MB",
    }
]

// type-based
const emit = defineEmits<{
  (e: 'update:config', config: Options): void
}>()

function updateFilename(value:string){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', { ...props.config, outputOptions: { ...props.config.outputOptions, outputFile: { ...props.config.outputOptions.outputFile, name: value } } });
}

function updateExtension(value:ReportExtension){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', { ...props.config, outputOptions: { ...props.config.outputOptions, outputFile: { ...props.config.outputOptions.outputFile, extension: value } } });
}


function updateFilepath(value:string){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', { ...props.config, outputOptions: { ...props.config.outputOptions, outputFile: { ...props.config.outputOptions.outputFile, path: value } } });
}

function updateQuality(value:number){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', { ...props.config, outputOptions: { ...props.config.outputOptions, outputQuality: value } });
}

</script>

<template>
    <div class="flex flex-col w-full gap-2" v-if="config != undefined">
        <SettingsField
        :value="config.outputOptions.outputFile.name"
        label="Filename"
        placeholder="(e.g., myreport)."
        @update:value="updateFilename"
        help-text="The report file will be saved as this name followed by the report number."
        />

        <SettingsList
            :value="config.outputOptions.outputFile.extension"
            label="File Extension"
            :options="reportExtensions"
            @update:value="updateExtension"
            help-text="The file extension of the report."
            placeholder="Select a file extension"
        >

        </SettingsList>

        <SettingsPathPicker
            :value="config.outputOptions.outputFile.path"
            label="Filepath"
            @update:value="updateFilepath"
            help-text="The path to save the report to."
        >

        </SettingsPathPicker>

        <SettingsSlider
            :value="config.outputOptions.outputQuality"
            label="Output Quality"
            help-text="The quality of the output image. Lower values will result in a smaller file size."
            :endText="fileSizes[config.outputOptions.outputQuality - 1].size"
            :min="1"
            :max="5"
            @update:value="updateQuality"
        />
        
    </div>
</template> 