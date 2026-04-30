const { contextBridge, webFrame } = require('electron');

try {
  contextBridge.exposeInMainWorld('profileRuntime', {
    app: 'Social Workbench',
    version: '0.1.0'
  });
} catch (_) {}

try {
  webFrame.executeJavaScript(`(() => {
    try {
      Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true });
    } catch (_) {}
    try {
      if (!window.chrome) Object.defineProperty(window, 'chrome', { get: () => ({ runtime: {}, loadTimes: () => ({}), csi: () => ({}) }), configurable: true });
    } catch (_) {}
  })();`, true);
} catch (_) {}
