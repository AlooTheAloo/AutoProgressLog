import { ankiListeners } from "./AnkiListeners";
import { DashboardListeners } from "./DashboardListeners";
import { routeListeners } from "./routeListener";
import { setupListeners } from "./SetupConfigBuilder";
import { surveyListeners } from "./SurveyListeners";
import { togglListeners } from "./togglListener";

export default function registerEvents(){
    routeListeners();
    togglListeners();
    setupListeners();
    ankiListeners();
    surveyListeners();
    DashboardListeners();
}