import { safeStorage, systemPreferences } from "electron";
import { ankiListeners } from "./AnkiListeners";
import { dashboardListeners } from "./DashboardListeners";
import { globalListeners } from "./globalListeners";
import { reportsListeners } from "./ReportsListeners";
import { routeListeners } from "./routeListener";
import { settingsListeners } from "./SettingsListeners";
import { setupListeners } from "./SetupConfigBuilder";
import { surveyListeners } from "./SurveyListeners";
import { APLStorage } from "./util/auth";

export default function registerEvents() {
  globalListeners();
  routeListeners();
  setupListeners();
  ankiListeners();
  surveyListeners();
  dashboardListeners();
  reportsListeners();
  settingsListeners();
}
