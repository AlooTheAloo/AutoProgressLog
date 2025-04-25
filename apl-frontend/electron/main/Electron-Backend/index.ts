import { ankiListeners } from "./ankiListeners";
import { dashboardListeners } from "./dashboardListeners";
import { globalListeners } from "./globalListeners";
import { reportsListeners } from "./reportsListeners";
import { routeListeners } from "./routeListener";
import { settingsListeners } from "./settingsListeners";
import { setupListeners } from "./setupConfigBuilder";
import { surveyListeners } from "./surveyListeners";
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
