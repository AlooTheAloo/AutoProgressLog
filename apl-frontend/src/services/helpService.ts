import { Component } from "vue";
import GeneratingReports from "../components/Help/GeneratingReports.vue";
import DashboardPageHelp from "../components/Help/DashboardPageHelp.vue";

export interface helpPage {
  title: string;
  description: string;
  component: Component;
}

const helpPages: helpPage[] = [
  {
    title: "Dashboard",
    description:
      "The dashboard is where you can view your progress and generate reports.",
    component: DashboardPageHelp,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
  {
    title: "Reports",
    description:
      "The reports page is where you can view your generated reports.",
    component: GeneratingReports,
  },
];

export const getHelpCenter = () => {
  return helpPages;
};
