import * as chrome from "../toggl/chrome-cookies-secure/index";
import { ListProfiles } from "../toggl/chromeProfileList";

const secureAcountSession = "__Secure-accounts-session"


const getCookies = async (url:string) => {
    var denied = false;
    const profiles = ListProfiles();
    const notableCookies:string[] = [];
    for (const p of profiles) {
        console.log(p.profileDirPath);
        try{
            const a = await chrome.getCookiesPromised(url, "object", p.profileDirPath)
            console.log(a);
            if(a["__Secure-accounts-session"] != null){
                notableCookies.push(`${secureAcountSession}=${a[secureAcountSession]};`);
                console.log("added to notable")
            }
        }
        catch(e){
            denied = true;
        }
    }
    console.log(notableCookies)

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
    return await Promise.all(cookies.map(async (x) => {
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
        const acc = await resp.json();
        return {
            id : acc.id,
            name : acc.fullname,
            api_token : acc.api_token,
            pfp_url : acc.image_url
        } as TogglAccount
    }))
}

