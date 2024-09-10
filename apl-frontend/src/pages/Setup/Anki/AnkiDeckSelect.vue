<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import AnkiLogo from '../../../assets/AnkiLogo.png';
    import { onMounted, ref } from 'vue';
import Listbox from 'primevue/listbox';
import ProgressSpinner from 'primevue/progressspinner';
    const message = ref<string>();
    const router = useRouter()
    const decks = ref<{name: string, cardCount: number; }[]>([]);

    onMounted(() => {
        selectedDecks.value = [];
        window.ipcRenderer.invoke("anki-decks-list").then((d) => {
            console.log(d);
            decks.value = d;
        })
    });

    const selectedDecks = defineModel<{name: string, cardCount: number; id: number; }[]>();

    function NextPage(){
        window.ipcRenderer.invoke("anki-deck-select", selectedDecks.value?.map(x => x.id)).then(() => {
            router.push('/setup/anki-reading');
        });
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow py-5 justify-start gap-2 text-left">
                <BackButton route="/setup/anki-home"/>
                <div class="font-semibold text-white text-4xl">
                    Let's select your decks!
                </div>
                <p class="text-sm">
                    Please select the decks you would like to track. You can select multiple decks and you will be able to change this later in the settings.
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-full ">
                        <Listbox v-if="decks.length > 0"
                        multiple scroll-height="none"
                        v-model="selectedDecks" :options="decks" style="gap: 2px;" class=" w-full">
                            <template #option="slotProps:{option: {name: string, cardCount: number; }, index: number}">
                                <div class="w-full flex flex-col">
                                    <div class="flex flex-col jusitfy-center h-full">
                                        <div class="font-semibold text-xl">
                                            {{slotProps.option.name}}
                                        </div>
                                        <div class="text-sm">
                                            {{ 
                                                slotProps.option.cardCount
                                            }} cards
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Listbox>
                        <div v-else>
                            <ProgressSpinner/>
                        </div>
                    </div>
                </div>
                <Button :disabled="selectedDecks?.length == 0" label="Continue!" @click="NextPage" class=" h-12 absolute w-full text-white font-semibold text-xl rounded-xl "/>
            </div>
        </div>
    </div>
    

</template>