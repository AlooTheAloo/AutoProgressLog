import { routeListeners } from "./routeListener";
import { togglListener } from "./togglListener";

export default function registerEvents(){
    console.log("Loading Electron-Backend");
    routeListeners();
    togglListener();
}