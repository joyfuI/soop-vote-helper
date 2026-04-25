import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, shell } from 'electron';

import createHttpServer from './createHttpServer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let serverAddress: Promise<string>;

const isInternalWindowOpen = (url: string) => {
  const target = new URL(url);
  if (process.env.VITE_DEV_SERVER_URL) {
    return target.origin === new URL(process.env.VITE_DEV_SERVER_URL).origin;
  }
  return target.protocol === 'file:';
};

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.mjs') },
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
  });

  win.loadURL(process.env.VITE_DEV_SERVER_URL ?? (await serverAddress));

  win.webContents.setWindowOpenHandler(({ url }) => {
    console.log('open', url);
    if (isInternalWindowOpen(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
        },
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

app.setPath(
  'appData',
  process.env.PORTABLE_EXECUTABLE_DIR ?? process.env.APP_ROOT,
);

if (process.env.VITE_DEV_SERVER_URL) {
  serverAddress = createHttpServer().listen({
    port: parseInt(import.meta.env.VITE_API_PORT, 10),
  });
} else {
  serverAddress = createHttpServer(RENDERER_DIST).listen({ port: 0 });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('browser-window-created', (_event, win) => {
  // test. 개발자도구 undocked 모드로 열기
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      event.preventDefault();
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools({ mode: 'undocked' });
      }
    }
  });
});

app.whenReady().then(createWindow);
