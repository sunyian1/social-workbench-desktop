import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('profileRuntime', {
  app: 'Social Workbench',
  version: '0.1.0'
});
