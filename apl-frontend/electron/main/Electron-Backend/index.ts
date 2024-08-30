import { ankiListeners } from "./AnkiListeners";
import { routeListeners } from "./routeListener";
import { setupListeners } from "./SetupConfigBuilder";
import { togglListener } from "./togglListener";

export default function registerEvents(){
    console.log("Loading Electron-Backend");
    routeListeners();
    togglListener();
    setupListeners();
    ankiListeners();
}