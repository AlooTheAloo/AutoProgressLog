
import { SocketClient } from "./SocketClient";
import { win } from "../../index";
import { Logger } from "../../../../apl-backend/Helpers/Log";

export function createSocketBridge() {

  console.log("CREATEING SOCKET BRIDGE");
  SocketClient.instance.on("ActivityStart", (data) => {
    console.log("Holy prout");
    win?.webContents.send("socket-event", { type: "ActivityStart", payload: data });
  });

  SocketClient.instance.on("ActivityStop", (data) => {
    console.log("Holy prout (stop)");
    win?.webContents.send("socket-event", { type: "ActivityStop", payload: data });
  });

  SocketClient.instance.on("ClearActivity", (data) => {
    win?.webContents.send("socket-event", { type: "ClearActivity", payload: data });
  });
}
