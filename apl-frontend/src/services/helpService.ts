import { Component } from "vue";
import ReportsHelp from "../components/Help/ReportsHelp.vue";
import Report from "../../src/assets/Icons/Sidebar/Reports.svg";
import Settings from "../../src/assets/Icons/Sidebar/Settings.svg";


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
    title: "Settings",
    description:
      "Learn about the different settings and features of APL and how to customize your experience.",
    component: ReportsHelp,
    icon: Settings,
  },
];

export const getHelpCenter = () => {
  return helpPages;
};
