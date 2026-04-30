const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('workbench', {
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    create: (input) => ipcRenderer.invoke('profiles:create', input),
    update: (id, patch) => ipcRenderer.invoke('profiles:update', id, patch),
    remove: (id) => ipcRenderer.invoke('profiles:remove', id),
    open: (id) => ipcRenderer.invoke('profiles:open', id),
    closeActive: () => ipcRenderer.invoke('profiles:close-active')
  },
  proxies: {
    list: () => ipcRenderer.invoke('proxies:list'),
    create: (input) => ipcRenderer.invoke('proxies:create', input),
    remove: (id) => ipcRenderer.invoke('proxies:remove', id)
  },
  platforms: () => ipcRenderer.invoke('platforms:list')
});
