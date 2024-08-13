import { routeListeners } from "./eventListener";

export default function registerEvents(){
    console.log("Loading Electron-Backend");
    routeListeners();
}