// Shown when the hosted app cannot be reached. It retries on its own, so the window recovers when
// the network comes back without the user doing anything.

const RETRY_SECONDS = 5;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildOfflineHtml(appUrl: string): string {
  const url = escapeHtml(appUrl);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="${RETRY_SECONDS};url=${url}">
<title>easyrender</title>
<style>
  :root { color-scheme: light dark; --bg: #ffffff; --fg: #09090b; --muted: #71717a; }
  @media (prefers-color-scheme: dark) { :root { --bg: #09090b; --fg: #fafafa; --muted: #a1a1aa; } }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--fg);
    font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  main { max-width: 22rem; padding: 1.5rem; text-align: center; }
  h1 { margin: 0 0 .5rem; font-size: 1.125rem; font-weight: 600; }
  p { margin: 0; color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>Can't reach easyrender</h1>
  <p>Check your connection. Retrying every ${RETRY_SECONDS} seconds. Your renders and credits are safe.</p>
</main>
</body>
</html>`;
}

export function offlineDataUrl(appUrl: string): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(buildOfflineHtml(appUrl))}`;
}
