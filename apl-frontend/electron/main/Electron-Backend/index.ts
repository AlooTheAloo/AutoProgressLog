import { ankiListeners } from "./AnkiListeners";
import { DashboardListeners } from "./DashboardListeners";
import { routeListeners } from "./routeListener";
import { setupListeners } from "./SetupConfigBuilder";
import { togglListener } from "./togglListener";

export default function registerEvents(){
    routeListeners();
    togglListener();
    setupListeners();
    ankiListeners();
    DashboardListeners();
}