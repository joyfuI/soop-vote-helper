import { contextBridge, ipcRenderer } from 'electron';

const electronApi = {
  // test
  testChat: (
    streamerId: string,
    userId: string,
    comment: string,
    username?: string,
  ) => {
    ipcRenderer.send('testChat', streamerId, userId, comment, username);
  },
};

contextBridge.exposeInMainWorld('electron', electronApi);

export type ElectronApi = typeof electronApi;
