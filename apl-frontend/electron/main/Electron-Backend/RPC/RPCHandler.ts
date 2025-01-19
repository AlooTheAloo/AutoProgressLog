import nodeScheduler, { Job } from "node-schedule"
import RPC from "discord-rpc";
import { getLiveActivity } from "../../../../apl-backend/toggl/toggl-service";
import { app } from "electron";
import { entry } from "../../../../apl-backend/types/entry";

const clientId = '1330290329261445221'; 
let ready = false;
let currentActivity:entry|null = null;
let job;
export function createAutoRPC(){
    const rpc = new RPC.Client({ transport: 'ipc' });
    rpc.login({ clientId }).catch(console.error);

    job = nodeScheduler.scheduleJob(`*/10 * * * * *`, async () => {
        if(!ready) return;
        const activity = await getLiveActivity();
        if(activity == undefined) return;
        if(currentActivity != null && activity.length == 0){
            rpc.clearActivity();
            currentActivity = null;
        }
        if(activity.length == 0) return;
        const single = activity[0];
        if(currentActivity?.id == single.id) return;

        rpc.setActivity({
            details: 'Immersing', // What the user is doing
            state: single.description, // What the user is doing
            instance: false,
            startTimestamp: new Date(single.start),
            // buttons: [
            //     {
            //         label: 'Get the app',
            //         url: 'https://www.aplapp.dev/#/',
            //     },
            // ],
        });
        console.log("Set activity to " + single.description);
        currentActivity = single;
    })

    rpc.on("ready", () => {
        ready = true;
     });
    
    app.on("before-quit", () => {
        if(currentActivity != null){
            rpc.clearActivity();
        }
    });
}