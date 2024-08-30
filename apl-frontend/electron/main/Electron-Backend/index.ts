import { ankiListeners } from "./AnkiListeners";
import { routeListeners } from "./routeListener";
import { setupListeners } from "./SetupConfigBuilder";
import { togglListener } from "./togglListener";

export default function registerEvents(){
    routeListeners();
    togglListener();
    setupListeners();
    ankiListeners();
}