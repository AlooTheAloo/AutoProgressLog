import * as chrome from "../toggl/chrome-cookies-secure/index.js";
import { ListProfiles } from "../toggl/chromeProfileList.ts";

const secureAcountSession = "__Secure-accounts-session"


const getCookies = async (url:string) => {
    var denied = false;
    const profiles = ListProfiles();
    const notableCookies:string[] = [];
    for (const p of profiles) {
        try{
            const a = await chrome.getCookiesPromised(url, "object", p.profileDirPath)
            if(a["__Secure-accounts-session"] != null){
                notableCookies.push(`${secureAcountSession}=${a[secureAcountSession]};`);
            }
        }
        catch(e){
            denied = true;
        }
    }

    return  denied ? [] : notableCookies;
}

const cook = await getCookies("https://toggl.com")
console.log(cook)

for (const c of cook) {

    fetch("https://api.track.toggl.com/api/v9/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authority": "track.toggl.com",
          "path": "/api/v9/me",
          "Cookie" : c,
          "Referer" :  "https://track.toggl.com/profile"
        },
        
      })
      .then(async (resp) => console.log((await resp.json())));
}
