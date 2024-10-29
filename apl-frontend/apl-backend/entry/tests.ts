import { config } from "process";
import { getLastUpdate } from "../anki/db";
import { getConfig } from "../Helpers/getConfig";

getLastUpdate(getConfig().anki.ankiIntegration).then(console.log);