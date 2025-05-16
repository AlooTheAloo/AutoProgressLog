import {Component} from "vue";
import GeneratingReports from "../components/Help/GeneratingReports.vue";
import DashboardPageHelp from "../components/Help/DashboardPageHelp.vue";
import {Overview, Reports, Settings} from "../assets/Icons/Sidebar/Icons";

export interface HelpPage {
    title: string;
    description: string;
    component: Component;
    icon?: string;
}

const helpPages: HelpPage[] = [
    {
        title: "Dashboard",
        description:
            "The dashboard is where you can view your progress and generate reports.",
        component: DashboardPageHelp,
        icon: Overview,
    },
    {
        title: "Reports",
        description:
            "The reports page is where you can view your generated reports.",
        component: GeneratingReports,
        icon: Reports,
    },
    {
        title: "Settings",
        description:
            "The settings page is where you can configure your application.",
        component: GeneratingReports,
        icon: Settings,
    }
];

export const getHelpCenter = () => {
    return helpPages;
};
