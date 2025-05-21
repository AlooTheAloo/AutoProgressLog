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

const CACHE_TTL = 60 * 1000; // 60 seconds

// In-memory caches
let installerCache: {
  timestamp: number;
  data: { platform: string; url: string | null }[] | null;
} = { timestamp: 0, data: null };

let releaseUrlCache: {
  timestamp: number;
  data: string | null;
} = { timestamp: 0, data: null };

export default new Elysia().get("/downloadLinks", async () => {
  const owner = "AlooTheAloo";
  const repo = "AutoProgressLog";

  const urls =
    (await getCachedInstallerUrl(owner, repo, ["windows", "mac", "linux"])) ??
    [];
  const [windowsUrl, macUrl, linuxUrl] = urls.map((x) => x.url);

  return {
    windowsUrl,
    macUrl,
    linuxUrl,
    releasesUrl: await getCachedLatestRelease(owner, repo),
  };
});

async function getCachedInstallerUrl(
  owner: string,
  repo: string,
  platforms: string[]
) {
  const now = Date.now();
  if (installerCache.data && now - installerCache.timestamp < CACHE_TTL) {
    return installerCache.data;
  }

  try {
    const data = await getInstallerUrl(owner, repo, platforms);
    installerCache = { timestamp: now, data };
    return data;
  } catch (err: any) {
    // On rate limit or any error, fall back to cache if available
    if (installerCache.data) {
      console.warn(
        "Rate limit or error fetching installer URLs, using cached data."
      );
      return installerCache.data;
    }
    throw err;
  }
}

async function getCachedLatestRelease(owner: string, repo: string) {
  const now = Date.now();
  if (releaseUrlCache.data && now - releaseUrlCache.timestamp < CACHE_TTL) {
    return releaseUrlCache.data;
  }

  try {
    const url = await getLatestRelease(owner, repo);
    releaseUrlCache = { timestamp: now, data: url };
    return url;
  } catch (err: any) {
    if (releaseUrlCache.data) {
      console.warn(
        "Rate limit or error fetching latest release, using cached URL."
      );
      return releaseUrlCache.data;
    }
    throw err;
  }
}

async function getInstallerUrl(
  owner: string,
  repo: string,
  platforms: string[]
) {
  const octokit = new Octokit();
  const assetNames = platforms.map((platform) =>
    platform === "windows" ? "latest.yml" : `latest-${platform}.yml`
  );

  try {
  } catch (err: any) {
    console.warn("Error fetching installer URLs, falling back to cache.");
    return installerCache.data;
  }

  const release = await octokit.repos.getLatestRelease({ owner, repo });
  const assets = assetNames.map((name) =>
    release.data.assets.find((a) => a.name === name)
  );

  const urls = await Promise.all(
    assets.map(async (asset) => {
      if (!asset) return null;
      const resp = await fetch(asset.browser_download_url);
      const text = await resp.text();
      const yml = yaml.load(text) as Release;
      return `https://github.com/${owner}/${repo}/releases/download/${release.data.tag_name}/${yml.path}`;
    })
  );

  return platforms.map((platform, i) => ({
    platform,
    url: urls[i],
  }));
}

async function getLatestRelease(owner: string, repo: string) {
  const octokit = new Octokit();
  const release = await octokit.repos.getLatestRelease({ owner, repo });
  return release.data.html_url;
}
