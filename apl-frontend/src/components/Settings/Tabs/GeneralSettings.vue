<script setup lang="ts">
import { Options } from '../../../../apl-backend/types/options';
import SettingsToggle from '../Common/SettingsToggle.vue';

const props = defineProps<{
    config:Options|undefined
}>()

// type-based
const emit = defineEmits<{
  (e: 'update:config', config: Options): void
}>()

</script>

<template>  
    <div class="flex flex-col w-full" v-if="config != undefined">
        <SettingsToggle :value="config.general.autogen.enabled" 
        label="Automatic Report Generation" 
        help-text="Automatically generate reports at a predetermined time interval. If your computer is turned off or disconnected from the internet, the reports will not be generated."
        @update:value="$emit('update:config', {...config, general:{...config.general, autogen:{...config.general.autogen, enabled: $event}}})"
        />
    </div>    
</template>