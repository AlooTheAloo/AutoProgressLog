import { Component } from "vue";
import ReportsHelp from "../components/Help/ReportsHelp.vue";
import Report from "../../src/assets/Icons/Sidebar/Reports.svg";
import Settings from "../../src/assets/Icons/Sidebar/Settings.svg";
import AnkiHelp from "../components/Help/AnkiHelp.vue";

export interface HelpPage {
  title: string;
  description: string;
  component: Component;
  icon?: string;
}

const helpPages: HelpPage[] = [
  {
    title: "Reports",
    description:
      "Learn about how to generate reports and how to use them to learn more efficiently.",
    component: ReportsHelp,
    icon: Report,
  },
  {
    title: "Anki",
    description:
      "Learn how to connect your Anki account to APL and how to use it to track your progress.",
    component: AnkiHelp,
    icon: Settings,
  },
];

export const getHelpCenter = () => {
  return helpPages;
};
