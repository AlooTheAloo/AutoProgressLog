<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'

import SetupBackground from '../../../components/Setup/SetupBackground.vue'
import AccountDisplay   from '../../../components/Common/AccountDisplay.vue'
import BackButton       from '../../../components/Common/BackButton.vue'
import Logo             from '../../../assets/Logo.png'
import AnkiLogo         from '../../../assets/AnkiLogo.png'

import Listbox          from 'primevue/listbox'
import ProgressSpinner  from 'primevue/progressspinner'
import Button           from 'primevue/button'

interface Deck {
  id: number
  name: string
  cardCount: number
}

const router = useRouter()
const decks = ref<Deck[]>([])
const selectedDecks = ref<Deck[]>([])

onMounted(async () => {
  // clear out any old selection
  selectedDecks.value = []
  // ask backend for all Anki decks
  decks.value = await window.ipcRenderer.invoke('anki-decks-list')
})

function NextPage() {
  const ids = selectedDecks.value.map(d => d.id)
  window.ipcRenderer
    .invoke('anki-deck-select', ids)
    .then(() => router.push('/setup/anki-reading'))
}
</script>

<template>
  <SetupBackground/>

  <div class="flex w-screen">
    <div class="p-4 sm:p-12 flex flex-col h-screen w-full max-w-[60rem] bg-black">
      <div class="space-y-6">
        <div class="flex w-full items-center justify-between">
          <img :src="Logo" class="w-16 h-16 sm:w-20 sm:h-20" alt="APL Logo"/>
          <AccountDisplay/>
        </div>

        <BackButton route="/setup/anki-home"/>

        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          Let’s select your decks!
        </h1>

        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0]">
          Please pick the decks you’d like to track. You can always
          modify this later in settings.
        </p>
      </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{ duration: 0.6 } }"
        class="flex flex-1 w-full justify-center items-center"
      >
        <Listbox
          v-if="decks.length"
          v-model="selectedDecks"
          :options="decks"
          multiple
          optionLabel="name"
          class="w-full max-w-[24rem] p-2 bg-[#18181B] rounded-lg"
        >
          <template #option="{ option }">
            <div class="p-3 hover:bg-zinc-800 cursor-pointer rounded">
              <div class="font-semibold text-white">{{ option.name }}</div>
              <div class="text-sm text-gray-400">{{ option.cardCount }} cards</div>
            </div>
          </template>
        </Listbox>
        <div v-else class="flex justify-center">
          <ProgressSpinner style="width:3rem; height:3rem" />
        </div>
      </motion.div>
      <div class="flex justify-end mt-auto">
        <Button
          label="Continue"
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full"
          :disabled="!selectedDecks.length"
        />
      </div>
    </div>

    <div class="flex-grow"></div>
  </div>
</template>

