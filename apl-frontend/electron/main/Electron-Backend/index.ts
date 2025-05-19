import { ankiListeners } from "./AnkiListeners";
import { dashboardListeners } from "./DashboardListeners";
import { globalListeners } from "./globalListeners";
import { reportsListeners } from "./ReportsListeners";
import { routeListeners } from "./routeListener";
import { settingsListeners } from "./SettingsListeners";
import { setupListeners } from "./SetupConfigBuilder";
import { surveyListeners } from "./SurveyListeners";
import { togglListeners } from "./togglListener";

export default function registerEvents() {
  globalListeners();
  routeListeners();
  togglListeners();
  setupListeners();
  ankiListeners();
  surveyListeners();
  dashboardListeners();
  reportsListeners();
  settingsListeners();
}
