
<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import RadioButton from 'primevue/radiobutton';
    import { onMounted, ref, watch } from 'vue';
    import pluralize from "pluralize";
    import MatureCardsIcon from "../../../../apl-backend/apl-visuals/public/Icons/MatureCards.png";
    import RetentionIcon from "../../../../apl-backend/apl-visuals/public/Icons/Retention.png";
    import ProgressSpinner from 'primevue/progressspinner';

    interface algorithm {
        key: string;
        name: string;
    }
    
    const retentionAlgorithms:algorithm[] = [
        { key: "true_retention", name: "TrueRetention (recommended)" },   
        { key: "default_anki", name: "Default Anki Retention" },
    ];
    const selectedAlgorithm = defineModel<string>('selectedAlgorithm');

    onMounted(() => {
        selectedAlgorithm.value = retentionAlgorithms[0].key;
        console.log(selectedAlgorithm.value);
        window.ipcRenderer.invoke("anki-read-data", selectedAlgorithm.value).then((data) => {
            cardCount.value = data.matureCardCount;
            retentionRate.value = data.retentionRate;
        })
    })

    watch(selectedAlgorithm, () => {
        window.ipcRenderer.invoke("anki-read-data", selectedAlgorithm.value).then((data) => {
            cardCount.value = data.matureCardCount;
            retentionRate.value = data.retentionRate;
        })
    })

    const cardCount = ref<number>()
    const retentionRate = ref<number>();
    
    const router = useRouter()
    function NextPage(){
        window.ipcRenderer.invoke("SetRetentionMode", selectedAlgorithm.value);
        router.push('/setup/pick-filename');
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-1/2 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow py-5 gap-2 text-left ">
                <BackButton route="/setup/anki-home"/>
                <div class="font-semibold text-white text-4xl">
                    Now, let’s try to read some data.
                </div>
                <p class="text-sm">
                    Now that anki is connected, here are some statistics. <br>Please also use this opportunity to select your desired retention algorithm.             
                </p>
                <div class=" flex flex-grow flex-col justify-center gap-2">
                    <div v-for="category in retentionAlgorithms" :key="category.key" class="flex items-center text-xl">
                        <RadioButton  v-model="selectedAlgorithm" :inputId="category.key" name="dynamic" :value="category.key" />
                        <label :for="category.key" class="ml-2 font-semibold px-1">{{ category.name }}</label>
                    </div>
                </div>
                <div class="flex justify-end">
                    <Button 
                    @click="NextPage"
                    style="width: 120px;"
                    label="Continue"
                    />    
                </div>
            </div>

        </div>
        <div class="flex justify-center items-center flex-col gap-5 w-1/2" v-if="cardCount != undefined && retentionRate != undefined">
            <div class="w-72 h-36 bg-black rounded-xl flex items-center justify-center">
                <div class="h-36 w-72 flex justify-end pr-5 absolute">
                    <div class=" mt-5 w-10">
                        <img v-bind:src="MatureCardsIcon">
                    </div>
                </div>
                <div class="flex w-4/5 justify-center h-20 ">
                    <div class="flex-grow flex flex-col justify-center">
                        <div class="font-normal tracking-wider">
                            Total Mature Cards
                        </div>
                        <div class="font-extrabold text-3xl">
                            <div class=" flex flex-row">
                                <div>
                                    {{ pluralize("cards", cardCount, true)}} 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <div class="w-72 h-36 bg-black rounded-xl flex items-center justify-center">
                <div class="h-36 w-72 flex justify-end pr-5 absolute">
                    <div class=" mt-5 w-10">
                        <img v-bind:src="RetentionIcon">
                    </div>
                </div>
                <div class="flex w-4/5 justify-center h-20 ">
                    <div class="flex-grow flex flex-col justify-center">
                        <div class="font-normal tracking-wider">
                            Retention rate
                        </div>
                        <div class="font-extrabold text-3xl">
                            <div class=" flex flex-row">
                                <div>
                                    {{ retentionRate }}% 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <ProgressSpinner/>
        </div>
    </div>
    

</template>