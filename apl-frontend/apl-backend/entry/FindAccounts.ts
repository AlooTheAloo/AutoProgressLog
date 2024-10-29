import { ListProfiles } from "../toggl/chromeProfileList";
import * as chrome from "../toggl/chrome-cookies-secure"
import { writeFile, writeFileSync } from "fs";
const secureAcountSession = "__Secure-accounts-session"


const getCookies = async (url:string) => {


    var denied = false;
    const profiles = ListProfiles();
    console.log(profiles);
    
    const notableCookies:string[] = [];
    for (const p of profiles) {
        try{
            const a = await chrome.getCookiesPromised(url, "object", p.profileDirPath + (process.platform == "win32" ? '\\Network' : ''))
            if(a[secureAcountSession] != null){
                notableCookies.push(`${secureAcountSession}=${a[secureAcountSession]};`);
            }
        }
        catch(e){
            denied = true;
        }
    }

    return  denied ? [] : notableCookies;
}

export interface TogglAccount {
    id: string;
    name: string;
    api_token: string;
    pfp_url: string;
}

export async function getAccounts() : Promise<TogglAccount[]> {

    const cookies = await getCookies("https://toggl.com")
    return (await Promise.all(cookies.map(async (x) => {
        writeFileSync("cookies.txt", x);
        const resp = await fetch("https://api.track.toggl.com/api/v9/me", {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            "authority": "track.toggl.com",
            "path": "/api/v9/me",
            "Cookie" : x,
            "Referer" :  "https://track.toggl.com/profile"
            },
        })

        if(resp.body == null || resp.status != 200){
            return undefined;
        }
        const acc = await resp.json();
        console.log("connected to " + acc.fullname);
        return {
            id : acc.id,
            name : acc.fullname,
            api_token : acc.api_token,
            pfp_url : acc.image_url
        } as TogglAccount
    }))).filter(x => x != undefined) as TogglAccount[];
}

