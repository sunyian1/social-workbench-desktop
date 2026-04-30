import type { FingerprintConfig } from '../../shared/types.js';

export function buildFingerprintScript(config: FingerprintConfig): string {
  const c = JSON.stringify(config || {});
  return `(() => {
    const cfg = ${c};
    const define = (obj, prop, value) => {
      if (value === undefined || value === null) return;
      try { Object.defineProperty(obj, prop, { get: () => value, configurable: true }); } catch (_) {}
    };
    define(Navigator.prototype, 'platform', cfg.platform);
    define(Navigator.prototype, 'language', cfg.language);
    define(Navigator.prototype, 'languages', cfg.languages);
    define(Navigator.prototype, 'hardwareConcurrency', cfg.hardwareConcurrency);
    define(Navigator.prototype, 'deviceMemory', cfg.deviceMemory);
    define(Navigator.prototype, 'webdriver', false);
    define(Navigator.prototype, 'maxTouchPoints', 0);

    const fakePlugins = Object.freeze([
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
    ]);
    define(Navigator.prototype, 'plugins', fakePlugins);
    define(Navigator.prototype, 'mimeTypes', Object.freeze([{ type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' }]));

    try {
      const originalQuery = navigator.permissions && navigator.permissions.query ? navigator.permissions.query.bind(navigator.permissions) : null;
      if (originalQuery) {
        navigator.permissions.query = (parameters) => {
          if (parameters && parameters.name === 'notifications') return Promise.resolve({ state: Notification.permission, onchange: null });
          return originalQuery(parameters);
        };
      }
    } catch (_) {}

    if (cfg.screenWidth) {
      define(Screen.prototype, 'width', cfg.screenWidth);
      define(Screen.prototype, 'availWidth', cfg.screenWidth);
      define(window, 'innerWidth', Math.max(800, cfg.screenWidth - 120));
      define(window, 'outerWidth', cfg.screenWidth);
    }
    if (cfg.screenHeight) {
      define(Screen.prototype, 'height', cfg.screenHeight);
      define(Screen.prototype, 'availHeight', Math.max(600, cfg.screenHeight - 40));
      define(window, 'innerHeight', Math.max(600, cfg.screenHeight - 120));
      define(window, 'outerHeight', cfg.screenHeight);
    }
    define(Screen.prototype, 'colorDepth', cfg.colorDepth);
    define(Screen.prototype, 'pixelDepth', cfg.colorDepth);

    const chromeRuntime = { runtime: {}, loadTimes: () => ({}), csi: () => ({}) };
    try {
      if (!window.chrome) Object.defineProperty(window, 'chrome', { get: () => chromeRuntime, configurable: true });
    } catch (_) {}

    if (cfg.timezone && Intl && Intl.DateTimeFormat) {
      const old = Intl.DateTimeFormat.prototype.resolvedOptions;
      Intl.DateTimeFormat.prototype.resolvedOptions = function() {
        return { ...old.call(this), timeZone: cfg.timezone, locale: cfg.language || old.call(this).locale };
      };
    }

    const patchWebgl = (Context) => {
      if (!Context || !Context.prototype) return;
      const oldGetParameter = Context.prototype.getParameter;
      Context.prototype.getParameter = function(parameter) {
        if (parameter === 37445 && cfg.webglVendor) return cfg.webglVendor;
        if (parameter === 37446 && cfg.webglRenderer) return cfg.webglRenderer;
        return oldGetParameter.call(this, parameter);
      };
    };
    patchWebgl(window.WebGLRenderingContext);
    patchWebgl(window.WebGL2RenderingContext);

    const perturbCanvas = (canvas) => {
      if (!cfg.canvasNoise || !canvas || !canvas.width || !canvas.height) return;
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const x = Math.min(canvas.width - 1, Math.floor(Number(cfg.canvasNoise) * canvas.width));
        const y = Math.min(canvas.height - 1, Math.floor(Number(cfg.canvasNoise) * canvas.height));
        const image = ctx.getImageData(Math.max(0, x), Math.max(0, y), 1, 1);
        image.data[0] = (image.data[0] + 1) % 255;
        ctx.putImageData(image, Math.max(0, x), Math.max(0, y));
      } catch (_) {}
    };

    if (cfg.canvasNoise && window.HTMLCanvasElement) {
      const oldToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        perturbCanvas(this);
        return oldToDataURL.apply(this, args);
      };
      const oldToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function(...args) {
        perturbCanvas(this);
        return oldToBlob.apply(this, args);
      };
    }

    if (cfg.canvasNoise && window.CanvasRenderingContext2D) {
      const oldGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        const data = oldGetImageData.apply(this, args);
        try { data.data[0] = (data.data[0] + 1) % 255; } catch (_) {}
        return data;
      };
    }

    const addAudioNoise = (buffer) => {
      if (!cfg.audioNoise || !buffer || !buffer.getChannelData) return buffer;
      try {
        const offset = Number(cfg.audioNoise) / 10000000;
        for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
          const data = buffer.getChannelData(channel);
          for (let i = 0; i < data.length; i += 100) data[i] += offset;
        }
      } catch (_) {}
      return buffer;
    };

    if (cfg.audioNoise && window.AudioBuffer) {
      const oldGetChannelData = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = function(channel) {
        const data = oldGetChannelData.call(this, channel);
        try {
          const offset = Number(cfg.audioNoise) / 10000000;
          for (let i = 0; i < data.length; i += 100) data[i] += offset;
        } catch (_) {}
        return data;
      };
    }

    if (cfg.audioNoise && window.OfflineAudioContext) {
      const oldStartRendering = OfflineAudioContext.prototype.startRendering;
      OfflineAudioContext.prototype.startRendering = function(...args) {
        const result = oldStartRendering.apply(this, args);
        if (result && typeof result.then === 'function') return result.then(addAudioNoise);
        return result;
      };
    }
  })();`;
}
