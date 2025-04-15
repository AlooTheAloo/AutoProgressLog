import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";
import Elysia from "elysia";

interface Release {
  version: string;
  files: {
    url: string;
    sha512: string;
    size: number;
  }[];
  path: string;
  sha512: string;
  releaseDate: string;
}

export default new Elysia().get("/downloadLinks", async ({ set, body }) => {
  const owner = "727apps";
  const repo = "AutoUpdateTest";

  const windowsUrl = await getInstallerUrl(owner, repo, "windows");
  const macUrl = await getInstallerUrl(owner, repo, "mac");
  const linuxUrl = await getInstallerUrl(owner, repo, "linux");

  console.log({ windowsUrl, macUrl, linuxUrl });

  return {
    windowsUrl: windowsUrl,
    macUrl: macUrl,
    linuxUrl: linuxUrl,
    releasesUrl: await getLatestRelease(owner, repo),
  };
});

async function getInstallerUrl(owner: string, repo: string, platform: string) {
  const octokit = new Octokit();

  const assetName = `latest-${platform}.yml`;

  // Fetch the latest release
  const release = await octokit.repos.getLatestRelease({ owner, repo });

  // Find the correct .yml file
  const ymlAsset = release.data.assets.find((a) => a.name === assetName);
  if (!ymlAsset) return null;

  // Fetch and parse the .yml file
  const ymlResponse = await fetch(ymlAsset.browser_download_url);
  const ymlText = await ymlResponse.text();
  const ymlData = yaml.load(ymlText) as Release;

  // Construct the direct download URL
  const baseUrl = `https://github.com/${owner}/${repo}/releases/download/${release.data.tag_name}/${ymlData.path}`;
  return baseUrl;
}

async function getLatestRelease(owner: string, repo: string) {
  const octokit = new Octokit();

  // Fetch the latest release
  const release = await octokit.repos.getLatestRelease({ owner, repo });
  return release.data.html_url;
}
