
import { SocketClient } from "./SocketClient";
import { win } from "../../index";
import { Logger } from "../../../../apl-backend/Helpers/Log";

export function createSocketBridge() {

  console.log("CREATEING SOCKET BRIDGE");
  SocketClient.instance.on("ActivityStart", (data) => {
    console.log("Holy prout");
    if (win && !win.isDestroyed()) {
      win.webContents.send("socket-event", { type: "ActivityStart", payload: data });
    }
  });

  SocketClient.instance.on("ActivityStop", (data) => {
    console.log("Holy prout (stop)");
    if (win && !win.isDestroyed()) {
      win.webContents.send("socket-event", { type: "ActivityStop", payload: data });
    }
  });

  SocketClient.instance.on("ClearActivity", (data) => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("socket-event", { type: "ClearActivity", payload: data });
    }
  });
}
