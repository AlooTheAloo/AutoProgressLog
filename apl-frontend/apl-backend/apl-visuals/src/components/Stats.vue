<script setup lang="ts">
    import { ReportData } from "../types/report-data";
    import TotalScore from "./Widgets/TotalScore.vue";
    import AnkiData from "./Widgets/PublicWidgets/AnkiData.vue";
    import AnkiStreak from "./Widgets/PublicWidgets/AnkiStreak.vue";
    import ImmersionData from "./Widgets/PublicWidgets/ImmersionData.vue";
    import ImmersionStreak from "./Widgets/PublicWidgets/ImmersionStreak.vue";
    import pMature from "./Widgets/PublicWidgets/pMature.vue";
    import pImmersionLog from "./Widgets/PublicWidgets/pImmersionLog.vue";
import MoreImmersionData from "./Widgets/PublicWidgets/MoreImmersionData.vue";

    const widgetMap = {
      mature: pMature,
      ankidata: AnkiData,
      ankistreak: AnkiStreak,
      immersiondata: ImmersionData,
      immersionlog: pImmersionLog,
      immersionstreak: ImmersionStreak,
      moreimmersiondata: MoreImmersionData
    };

    function getItemById(itemId: keyof typeof widgetMap) {
        return itemId ? widgetMap[itemId] || null : null;
    }

    interface statsProps {
        reportData:ReportData,
        layout:string[][]
    }

    const props = defineProps<statsProps>();

</script>

<template>
    <div class="flex flex-col h-full w-full flex-grow gap-12 ">
        <div class="w-full flex gap-8 ">
          <div class="w-0 h-full flex flex-col flex-grow gap-5" v-for="(item, index) in props.layout" :key="index">
            <component v-for="comp in item" :is="getItemById(comp as any)" :reportData="props.reportData"/>
          </div>
        </div>
        <div class="w-full">
          <TotalScore :data="props.reportData"></TotalScore>
        </div>
    </div> 
</template>