import {
  EdenClient,
  SERVER_URL,
} from "../../electron/main/Electron-Backend/api/ApiManager";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth";
import { NotificationManager } from "../Helpers/notifications";

const DEFAULT_PFP =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7mMNz8YCBvYmnr3BQUPX__YsC_WtDuAevwg&s";

export function setSyncing(value: boolean) {}

// TODO : Add this back in
export function isSyncing() {
  return false;
}

export async function runSync() {
  try {
    const fetchedDTO = await EdenClient.user.sync.post("", {
      headers: {
        authorization: `Bearer ${await APLStorage.get("token")}`,
      },
    });

    if(fetchedDTO.error){
      throw new Error(fetchedDTO.error.value as any ?? "Unknown error");
    }

    if (fetchedDTO.data == null) return null;
    if (fetchedDTO.data.profile_picture == "")
      fetchedDTO.data.profile_picture = DEFAULT_PFP;
    else
      fetchedDTO.data.profile_picture = `http://${SERVER_URL}${fetchedDTO.data.profile_picture}`;

    await APLStorage.set("Cached_DTO", fetchedDTO.data);
    return fetchedDTO.data;
  } catch (e) {
    NotificationManager.notify({
      header: "Cannot complete sync!!",
      content:
        `APL was unable to synchronize your data. <br>
        Please report an issue on the <a href='https://github.com/AlooTheAloo/AutoProgressLog/issues'>GitHub issue tracker</a>. <br> 
        Additional information : 
        ` + (e?.toString() ?? "No additional information provided"),
    });
  }
}
