import { Elysia, t } from 'elysia';
import { Octokit } from '@octokit/rest';
import yaml from 'js-yaml';

const CACHE_TTL = 60 * 1000;

let installerCache: {
    timestamp: number;
    data: { platform: string; url: string | null }[] | null;
} = { timestamp: 0, data: null };

let releaseUrlCache: {
    timestamp: number;
    data: string | null;
} = { timestamp: 0, data: null };

async function getInstallerUrl(owner: string, repo: string, platforms: string[]) {
    const octokit = new Octokit();
    const assetNames = platforms.map((platform) =>
        platform === 'windows' ? 'latest.yml' : `latest-${platform}.yml`
    );

    const release = await octokit.repos.getLatestRelease({ owner, repo });
    const assets = assetNames.map((name) =>
        release.data.assets.find((a) => a.name === name)
    );

    const urls = await Promise.all(
        assets.map(async (asset) => {
            if (!asset) return null;
            const resp = await fetch(asset.browser_download_url);
            const text = await resp.text();
            const yml = yaml.load(text) as { path: string };
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

export const downloadLinksRoute = new Elysia({ name: 'download-links' }).get(
    '/download-links',
    async () => {
        const owner = 'AlooTheAloo';
        const repo = 'AutoProgressLog';
        const platforms = ['windows', 'mac', 'linux'];
        const now = Date.now();

        const urls =
            installerCache.data && now - installerCache.timestamp < CACHE_TTL
                ? installerCache.data
                : await getInstallerUrl(owner, repo, platforms).then((data) => {
                    installerCache = { timestamp: now, data };
                    return data;
                });

        const releasesUrl =
            releaseUrlCache.data && now - releaseUrlCache.timestamp < CACHE_TTL
                ? releaseUrlCache.data
                : await getLatestRelease(owner, repo).then((url) => {
                    releaseUrlCache = { timestamp: now, data: url };
                    return url;
                });

        const [windowsUrl, macUrl, linuxUrl] = urls.map((x) => x.url);

        return {
            windowsUrl,
            macUrl,
            linuxUrl,
            releasesUrl,
        };
    },
    {
        response: t.Object({
            windowsUrl: t.Nullable(t.String({ format: 'uri', example: 'https://...' })),
            macUrl: t.Nullable(t.String({ format: 'uri', example: 'https://...' })),
            linuxUrl: t.Nullable(t.String({ format: 'uri', example: 'https://...' })),
            releasesUrl: t.String({ format: 'uri', example: 'https://github.com/AlooTheAloo/AutoProgressLog/releases/tag/vX.X.X' }),
        }),
        detail: {
            summary: 'Get latest installer download URLs',
            tags: ['Download Links'],
            description: 'Returns direct download links for Windows, macOS, and Linux installers from the latest GitHub release.',
        },
    }
);
