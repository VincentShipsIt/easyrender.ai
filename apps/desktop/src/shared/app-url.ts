// Pure URL policy for the desktop shell. Nothing here imports electron, so it is unit tested.

export const DEFAULT_APP_URL = 'https://easyrender.ai/dashboard';
export const APP_PROTOCOL = 'easyrender';

// Paths the signed-in web app serves today. A deep link may only open one of these.
const APP_PATH_PREFIXES = ['/dashboard', '/library', '/connectors', '/credits', '/account', '/r'];

function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/** The URL the window loads: EASYRENDER_DESKTOP_APP_URL when it is valid, else production. */
export function resolveAppUrl(override: string | undefined): URL {
  if (override) {
    try {
      const url = new URL(override);
      // Plain http is for a local `bun run dev`, never for a real host.
      if (url.protocol === 'https:' || (url.protocol === 'http:' && isLocalhost(url.hostname))) {
        return url;
      }
    } catch {
      // Fall through to the default.
    }
  }
  return new URL(DEFAULT_APP_URL);
}

export type NavigationDecision = 'allow' | 'external' | 'deny';

/**
 * Where a navigation or a window.open goes. The app origin stays in the window. Any other https
 * site (a docs link, Stripe Checkout, Google sign-in) opens in the system browser, so a page we do
 * not control never gets the app's session or its preload. Every other scheme is dropped.
 */
export function decideNavigation(target: string, appOrigin: string): NavigationDecision {
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return 'deny';
  }
  if (url.origin === appOrigin) return 'allow';
  if (url.protocol === 'https:' || url.protocol === 'mailto:') return 'external';
  return 'deny';
}

/** Maps easyrender://open/library to https://<app origin>/library. Anything else is null. */
export function resolveDeepLink(link: string, appOrigin: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== `${APP_PROTOCOL}:` || url.hostname !== 'open') return null;
  const path = url.pathname || '/';
  if (path.startsWith('//')) return null;
  if (!APP_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return null;
  }
  return new URL(`${path}${url.search}`, appOrigin).toString();
}

/** The easyrender:// link in a process argv (Windows and Linux deliver deep links this way). */
export function findDeepLinkInArgv(argv: string[]): string | undefined {
  return argv.find((arg) => arg.startsWith(`${APP_PROTOCOL}://`));
}
