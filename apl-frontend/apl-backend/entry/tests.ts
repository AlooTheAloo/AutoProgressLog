// import { Octokit } from "@octokit/rest";
// import yaml from "js-yaml";
import * as fzstd from "fzstd";
import dayjs from "dayjs";
import { getTimeEntries, toggl } from "../toggl/toggl-service";
import { writeFileSync } from "fs";
import AnkiHTTPClient from "./AnkiHTTPClient";
import NormalSyncer from "./NormalSyncer";
import Storage from "./Storage";

// interface Release {
//   version: string;
//   files: {
//     url: string;
//     sha512: string;
//     size: number;
//   }[];
//   path: string;
//   sha512: string;
//   releaseDate: string;
// }

// const octokit = new Octokit();

// async function getInstallerUrl(owner: string, repo: string, platform: string) {
//   const assetName = `latest-${platform}.yml`;

//   // Fetch the latest release
//   const release = await octokit.repos.getLatestRelease({ owner, repo });

//   // Find the correct .yml file
//   const ymlAsset = release.data.assets.find((a) => a.name === assetName);
//   if (!ymlAsset) return null;

//   // Fetch and parse the .yml file
//   const ymlResponse = await fetch(ymlAsset.browser_download_url);
//   const ymlText = await ymlResponse.text();
//   const ymlData = yaml.load(ymlText) as Release;

//   // Construct the direct download URL
//   const baseUrl = `https://github.com/${owner}/${repo}/releases/download/${release.data.tag_name}/${ymlData.path}`;
//   return baseUrl;
// }

// (async () => {
//   const owner = "AlooTheAloo";
//   const repo = "AutoProgressLog";

//   const windowsUrl = await getInstallerUrl(owner, repo, "windows");
//   const macUrl = await getInstallerUrl(owner, repo, "mac");
//   const linuxUrl = await getInstallerUrl(owner, repo, "linux");

//   console.log({ windowsUrl, macUrl, linuxUrl });
// })();
// import { writeFileSync } from "fs";

// async function testing() {
//   const client = new AnkiHTTPClient();
//   const storage = new Storage("./collection.anki2");
//   const Syncer = new NormalSyncer(client, storage);

//   await client.login("", "");
//   await client.getMetaUSN();
//   await client.downloadInitialDatabase("db.sql");
//   Syncer.start();
// }

// testing();

// fixUnicaseCollation(
//   "/Users/philipanthony-davis/Library/Application Support/autoprogresslog/anki.db"
// );

// getTimeEntries(1738012699);

import { TogglWebhookClient } from "toggl-webhook";
import Toggl from "toggl-track";

export async function createWebhook() {
  const client = new TogglWebhookClient({
    apiToken: "b3f7c1e583889aa8964bd1d87b21a3e8",
  });

  const response = await client.createSubscription({
    workspace_id: 8279376,
    url_callback: "https://apl.chromaserver.net/webhooks/toggl",
    event_filters: [
      {
        entity: "time_entry",
        action: "*",
      },
    ],
    description: "Event updates",
    enabled: true,
  });
}

createWebhook();
