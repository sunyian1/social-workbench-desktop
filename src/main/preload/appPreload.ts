import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('workbench', {
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    create: (input: unknown) => ipcRenderer.invoke('profiles:create', input),
    update: (id: string, patch: unknown) => ipcRenderer.invoke('profiles:update', id, patch),
    remove: (id: string) => ipcRenderer.invoke('profiles:remove', id),
    open: (id: string) => ipcRenderer.invoke('profiles:open', id)
  },
  proxies: {
    list: () => ipcRenderer.invoke('proxies:list'),
    create: (input: unknown) => ipcRenderer.invoke('proxies:create', input),
    remove: (id: string) => ipcRenderer.invoke('proxies:remove', id)
  },
  platforms: () => ipcRenderer.invoke('platforms:list')
});
