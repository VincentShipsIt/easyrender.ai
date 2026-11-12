import path from 'node:path';
import {
  app,
  BrowserWindow,
  type Event as ElectronEvent,
  Menu,
  type MenuItemConstructorOptions,
  nativeTheme,
  shell,
} from 'electron';
import {
  APP_PROTOCOL,
  decideNavigation,
  findDeepLinkInArgv,
  resolveAppUrl,
  resolveDeepLink,
} from './shared/app-url';
import { offlineDataUrl } from './shared/offline-page';

const appUrl = resolveAppUrl(process.env.EASYRENDER_DESKTOP_APP_URL);
const appOrigin = appUrl.origin;
const isMac = process.platform === 'darwin';

// The window background matches the page so the first paint has no white flash in dark mode.
const BACKGROUND_LIGHT = '#ffffff';
const BACKGROUND_DARK = '#09090b';
// An aborted load (ERR_ABORTED) is a navigation replaced by another one, not a failure.
const ERR_ABORTED = -3;

let mainWindow: BrowserWindow | null = null;

function openExternal(url: string): void {
  // decideNavigation already limited this to https and mailto.
  void shell.openExternal(url);
}

function guardNavigation(event: ElectronEvent, url: string): void {
  const decision = decideNavigation(url, appOrigin);
  if (decision === 'allow') return;
  event.preventDefault();
  if (decision === 'external') openExternal(url);
}

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'easyrender',
    backgroundColor: nativeTheme.shouldUseDarkColors ? BACKGROUND_DARK : BACKGROUND_LIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once('ready-to-show', () => window.show());
  window.webContents.on('will-navigate', guardNavigation);
  window.webContents.on('will-redirect', guardNavigation);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (decideNavigation(url, appOrigin) === 'external') openExternal(url);
    // A same-origin window.open (a share or print view) navigates the one window instead.
    else if (decideNavigation(url, appOrigin) === 'allow') void window.loadURL(url);
    return { action: 'deny' };
  });
  window.webContents.on(
    'did-fail-load',
    (_event, errorCode, _description, failedUrl, isMainFrame) => {
      if (!isMainFrame || errorCode === ERR_ABORTED || failedUrl.startsWith('data:')) return;
      void window.loadURL(offlineDataUrl(failedUrl));
    },
  );
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null;
  });

  void window.loadURL(appUrl.toString());
  return window;
}

function showWindow(): BrowserWindow {
  if (!mainWindow) mainWindow = createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  return mainWindow;
}

function openDeepLink(link: string): void {
  const target = resolveDeepLink(link, appOrigin);
  if (!target) return;
  void showWindow().loadURL(target);
}

function go(pathname: string): void {
  void showWindow().loadURL(new URL(pathname, appOrigin).toString());
}

function buildMenu(): void {
  const goItems: MenuItemConstructorOptions[] = [
    { label: 'Dashboard', accelerator: 'CmdOrCtrl+1', click: () => go('/dashboard') },
    { label: 'Library', accelerator: 'CmdOrCtrl+2', click: () => go('/library') },
    { label: 'Connectors', accelerator: 'CmdOrCtrl+3', click: () => go('/connectors') },
    { label: 'Credits', accelerator: 'CmdOrCtrl+4', click: () => go('/credits') },
  ];
  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' } as MenuItemConstructorOptions] : []),
    { label: 'File', submenu: [isMac ? { role: 'close' } : { role: 'quit' }] },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { label: 'Go', submenu: goItems },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Open in browser',
          click: () => openExternal(mainWindow?.webContents.getURL() || appUrl.toString()),
        },
        { label: 'easyrender.ai', click: () => openExternal(`${appOrigin}/`) },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // A second launch (or a Windows/Linux deep link) focuses the running window instead.
  app.on('second-instance', (_event, argv) => {
    const link = findDeepLinkInArgv(argv);
    if (link) openDeepLink(link);
    else showWindow();
  });
  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (app.isReady()) openDeepLink(url);
  });

  app
    .whenReady()
    .then(() => {
      app.setAsDefaultProtocolClient(APP_PROTOCOL);
      buildMenu();
      mainWindow = createWindow();
      const launchLink = findDeepLinkInArgv(process.argv);
      if (launchLink) openDeepLink(launchLink);
      app.on('activate', () => {
        showWindow();
      });
    })
    .catch(() => app.quit());

  app.on('window-all-closed', () => {
    if (!isMac) app.quit();
  });
}
