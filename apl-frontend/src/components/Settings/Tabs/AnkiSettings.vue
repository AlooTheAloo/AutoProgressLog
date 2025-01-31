<script setup lang="ts">
import { Options, RetentionMode } from '../../../../apl-backend/types/options';
import { ref } from 'vue';
import { watch } from 'vue';
import SettingsToggle from '../Common/SettingsToggle.vue';
import { WarningProps } from '../../../../types/Warning';
import SettingsPathPicker from '../Common/SettingsPathPicker.vue';
import SettingsField from '../Common/SettingsField.vue';
import Button from 'primevue/button';
import SettingsRadioSet from '../Common/SettingsRadioSet.vue';
import { deck } from '../../../../apl-backend/config/configAnkiIntegration';
import MultiSelect from 'primevue/multiselect';
import SettingsMultiSelect from '../Common/SettingsMultiSelect.vue';

interface algorithm {
    key: string;
    name: string;
}

const props = defineProps<{
    config:Options|undefined
}>();


const retentionAlgorithms:algorithm[] = [
    { key: "true_retention", name: "TrueRetention (recommended)" },   
    { key: "default_anki", name: "Default Anki Retention" },
];

const emit = defineEmits<{
  (e: 'update:config', config: Options): void,
  (e: 'danger', config: WarningProps | undefined): void,
  (e: 'ankitest:worked', worked: boolean): void,
}>()

const ankiTestPassed = ref<boolean>(false);
const canTest = ref<boolean>(true);

const decks = ref<deck[]>([]);
const selectedDecks = ref<number[]>([]);

function updateTrackedDecks(value:number[]){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', {...props.config, anki:{...props.config.anki, options:{...props.config.anki.options, trackedDecks: value}}});
}

function updateDBPath(value:string){
    if(props.config == undefined) return;
    ankiTestPassed.value = false;
    emit('update:config', {...props.config, anki:{...props.config.anki, ankiIntegration:{...props.config.anki.ankiIntegration, ankiDB: value}}});
}

function updateAnkiProfile(value:string){
    if(props.config == undefined) return;
    ankiTestPassed.value = false;
    emit('update:config', {...props.config, anki:{...props.config.anki, ankiIntegration:{...props.config.anki.ankiIntegration, profile: value}}});
}

function updateAnkiPath(value:string){
    if(props.config == undefined) return;
    ankiTestPassed.value = false;
    emit('update:config', {...props.config, anki:{...props.config.anki, ankiIntegration:{...props.config.anki.ankiIntegration, ankiPath: value}}});
}

function updateRetentionAlgorithm(value:RetentionMode){
    if(props.config?.anki?.options == undefined) return;
    emit('update:config', {...props.config, anki:{...props.config.anki, options:{...props.config.anki.options, retentionMode: value}}});
}

function testConnection(){
    const config = JSON.parse(JSON.stringify(props.config));
    canTest.value = false;
    window.ipcRenderer.invoke("test-anki-connection", config).then((retVal:{worked:boolean, decks:deck[]}) => {
        ankiTestPassed.value = retVal.worked;
        canTest.value = true;
        if(retVal.worked){
            decks.value = retVal.decks;
            selectedDecks.value = props.config?.anki?.options?.trackedDecks ?? [];
        }
    
        emit("ankitest:worked", retVal.worked);
    });
}

function updateAnki(value:boolean){
    if(props.config == undefined) return;
    const savedConfig = props.config;
    emit('update:config', {...props.config, anki:{enabled: false}});
    if(!value){
        emit('danger', {
            title: "Are you sure?",
            content: "This is a destructive operation. Disabling Anki Sync will remove all data from the APL anki databse. <br> You will lose your streak, mature cards and retention data.",
            yesText: "Yes",
            noText: "No",
            onYes: () => {
                if(props.config == undefined) return;
                emit("danger", undefined);

            },
            onNo: () => {
                if(props.config == undefined) return;
                emit("danger", undefined);
                emit('update:config', {...props.config, anki:{enabled: false}});
                emit('update:config', savedConfig);
            }
        })
    }
    else {
        emit("update:config", {
            ...props.config, 
            anki:{
                enabled: true, 
                ankiIntegration: props.config.anki.ankiIntegration ?? {
                    ankiPath: "/",
                    ankiDB: "/",
                    profile: "User 1"
                },
                options: props.config.anki.options ?? {
                    retentionMode: "true_retention",
                    trackedDecks: []
                }
            }
        });
    }
}

</script>

<template>  
    <div class="flex flex-col w-full gap-5 flex-grow  " v-if="config != undefined">
        <h1 class="text-2xl font-bold text-white mt-5">
            Connection settings
        </h1>
        <SettingsToggle 
        :value="config.anki.enabled" 
        label="Synchronize Anki"
        help-text="When enabled, synchronizes and updates your Anki retention rate, mature cards and reviews with APL."
        @update:value="updateAnki"
        />
       
        <SettingsPathPicker 
        :disabled="!config.anki.enabled"
        :value="config.anki.ankiIntegration?.ankiDB" 
        label="Anki Database Path"
        help-text="The path to your Anki database. The file should be named 'collection.anki2'.  Click for more information on how to find this path."
        link="https://docs.ankiweb.net/files.html#file-locations"
        @update:value="updateDBPath"
        />


        <SettingsPathPicker 
        :disabled="!config.anki.enabled"
        :value="config.anki.ankiIntegration?.ankiPath" 
        label="Anki App Path"
        help-text="Where the anki executable is located. On macOS, this is usually in the /Applications folder. On Windows, it's usually in the Program Files folder. On Linux, it's usually in the /usr/bin folder."
        @update:value="updateAnkiPath"
        />

        <SettingsField 
        :disabled="!config.anki.enabled"
        :value="config.anki.ankiIntegration?.profile" 
        label="Anki Profile Name"
        link="https://docs.ankiweb.net/profiles.html?highlight=profile#profiles"
        help-text="The name of your anki profile. By default, it is 'User 1'. Click for more information on how to find your profile name."
        @update:value="updateAnkiProfile"
        />

        
        <Button v-on:click="testConnection" 
        :disabled="!config.anki.enabled || !canTest">
        Test Connection
        </Button>

        <h1 class="text-2xl font-bold text-white mt-5 flex gap-1 items-end">
            Synchronization settings
            <div class="text-sm font-normal text-gray-200">
                (Test connection to enable)
            </div>
        </h1>

        <SettingsRadioSet
        :disabled="!ankiTestPassed"
        :value="config.anki.options?.retentionMode" 
        label="Retention Algorithm"
        help-text="The algorithm to use for retention calculations. The default is TrueRetention, which is the recommended algorithm."
        @update:value="updateRetentionAlgorithm"
        :options="retentionAlgorithms"
        />

        <SettingsMultiSelect
        label="Tracked Decks"
        help-text="The decks you would like to track. You can select multiple decks if you'd like."
        :value="selectedDecks"
        :options="decks"
        :disabled="!ankiTestPassed"
        v-on:update:value="updateTrackedDecks"
        >

        </SettingsMultiSelect>
    </div>   
</template>