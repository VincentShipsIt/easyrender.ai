import { contextBridge } from 'electron';

// The web app reads this to know it runs inside the desktop shell (for example to leave room for
// window controls). It carries no secrets and no way to reach Node.
contextBridge.exposeInMainWorld('easyrenderDesktop', {
  isDesktop: true,
  platform: process.platform,
});
