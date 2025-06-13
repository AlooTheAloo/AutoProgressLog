import { safeStorage, systemPreferences } from "electron";
import { ankiListeners } from "./AnkiListeners";
import { dashboardListeners } from "./DashboardListeners";
import { globalListeners } from "./globalListeners";
import { reportsListeners } from "./ReportsListeners";
import { routeListeners } from "./routeListener";
import { settingsListeners } from "./SettingsListeners";
import { setupListeners } from "./SetupConfigBuilder";
import { surveyListeners } from "./SurveyListeners";
import { togglListeners } from "./togglListener";
import keytar from "keytar";
const SERVICE = "MyElectronApp";
const ACCOUNT = "my–decryption–key";

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

  (async () => {})();
}
