import type { FingerprintConfig } from '../../shared/types.js';

export function buildFingerprintScript(config: FingerprintConfig): string {
  const c = JSON.stringify(config || {});
  return `(() => {
    const cfg = ${c};
    const define = (obj, prop, value) => {
      if (value === undefined || value === null || !obj) return;
      try { Object.defineProperty(obj, prop, { get: () => value, configurable: true }); } catch (_) {}
    };
    const defineValue = (obj, prop, value) => {
      if (value === undefined || value === null || !obj) return;
      try { Object.defineProperty(obj, prop, { value, configurable: true, writable: false }); } catch (_) {}
    };
    const nativeLike = (fn, name) => {
      try { Object.defineProperty(fn, 'toString', { value: () => 'function ' + name + '() { [native code] }', configurable: true }); } catch (_) {}
      return fn;
    };

    define(Navigator.prototype, 'platform', cfg.platform);
    define(Navigator.prototype, 'userAgent', cfg.userAgent);
    define(Navigator.prototype, 'appVersion', cfg.userAgent ? cfg.userAgent.replace(/^Mozilla\//, '') : undefined);
    define(Navigator.prototype, 'vendor', 'Google Inc.');
    define(Navigator.prototype, 'productSub', '20030107');
    define(Navigator.prototype, 'language', cfg.language);
    define(Navigator.prototype, 'languages', cfg.languages || (cfg.language ? [cfg.language] : undefined));
    define(Navigator.prototype, 'hardwareConcurrency', cfg.hardwareConcurrency);
    define(Navigator.prototype, 'deviceMemory', cfg.deviceMemory);
    define(Navigator.prototype, 'webdriver', false);
    define(Navigator.prototype, 'maxTouchPoints', 0);

    const pluginArray = [
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
    ];
    pluginArray.item = (i) => pluginArray[i] || null;
    pluginArray.namedItem = (name) => pluginArray.find((p) => p.name === name) || null;
    pluginArray.refresh = () => undefined;
    const mimeArray = [{ type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: pluginArray[0] }];
    mimeArray.item = (i) => mimeArray[i] || null;
    mimeArray.namedItem = (name) => mimeArray.find((m) => m.type === name) || null;
    define(Navigator.prototype, 'plugins', pluginArray);
    define(Navigator.prototype, 'mimeTypes', mimeArray);

    try {
      const originalQuery = navigator.permissions && navigator.permissions.query ? navigator.permissions.query.bind(navigator.permissions) : null;
      if (originalQuery) {
        navigator.permissions.query = nativeLike((parameters) => {
          if (parameters && parameters.name === 'notifications') return Promise.resolve({ state: Notification.permission, onchange: null });
          return originalQuery(parameters);
        }, 'query');
      }
    } catch (_) {}

    if (cfg.screenWidth) {
      define(Screen.prototype, 'width', cfg.screenWidth);
      define(Screen.prototype, 'availWidth', cfg.screenWidth);
    }
    if (cfg.screenHeight) {
      define(Screen.prototype, 'height', cfg.screenHeight);
      define(Screen.prototype, 'availHeight', Math.max(600, cfg.screenHeight - 40));
    }
    define(Screen.prototype, 'colorDepth', cfg.colorDepth);
    define(Screen.prototype, 'pixelDepth', cfg.colorDepth);

    const chromeRuntime = { runtime: {}, loadTimes: nativeLike(() => ({}), 'loadTimes'), csi: nativeLike(() => ({}), 'csi') };
    try {
      if (!window.chrome) Object.defineProperty(window, 'chrome', { get: () => chromeRuntime, configurable: true });
    } catch (_) {}

    if (cfg.timezone && Intl && Intl.DateTimeFormat) {
      const old = Intl.DateTimeFormat.prototype.resolvedOptions;
      Intl.DateTimeFormat.prototype.resolvedOptions = nativeLike(function() {
        const options = old.call(this);
        return { ...options, timeZone: cfg.timezone, locale: cfg.language || options.locale };
      }, 'resolvedOptions');
    }

    const maybeDebugRendererInfo = 37446;
    const maybeDebugVendorInfo = 37445;
    const patchWebgl = (Context) => {
      if (!Context || !Context.prototype) return;
      const oldGetParameter = Context.prototype.getParameter;
      Context.prototype.getParameter = nativeLike(function(parameter) {
        if (parameter === maybeDebugVendorInfo && cfg.webglVendor) return cfg.webglVendor;
        if (parameter === maybeDebugRendererInfo && cfg.webglRenderer) return cfg.webglRenderer;
        return oldGetParameter.call(this, parameter);
      }, 'getParameter');
    };
    patchWebgl(window.WebGLRenderingContext);
    patchWebgl(window.WebGL2RenderingContext);

    if (cfg.canvasNoise && window.CanvasRenderingContext2D) {
      const oldGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = nativeLike(function(...args) {
        const data = oldGetImageData.apply(this, args);
        try {
          if (data && data.data && data.data.length > 16) {
            const shift = Math.max(1, Math.floor(Number(cfg.canvasNoise) * 7));
            for (let i = 0; i < data.data.length; i += 97) data.data[i] = (data.data[i] + shift) & 255;
          }
        } catch (_) {}
        return data;
      }, 'getImageData');
    }

    if (cfg.canvasNoise && window.HTMLCanvasElement) {
      const oldToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = nativeLike(function(...args) {
        try {
          const ctx = this.getContext && this.getContext('2d');
          if (ctx && this.width && this.height) {
            const x = Math.max(0, Math.min(this.width - 1, Math.floor(Number(cfg.canvasNoise) * this.width)));
            const y = Math.max(0, Math.min(this.height - 1, Math.floor(Number(cfg.canvasNoise) * this.height)));
            const image = ctx.getImageData(x, y, 1, 1);
            image.data[0] = (image.data[0] + 1) & 255;
            ctx.putImageData(image, x, y);
          }
        } catch (_) {}
        return oldToDataURL.apply(this, args);
      }, 'toDataURL');
      const oldToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = nativeLike(function(...args) {
        try {
          const ctx = this.getContext && this.getContext('2d');
          if (ctx && this.width && this.height) {
            const x = Math.max(0, Math.min(this.width - 1, Math.floor(Number(cfg.canvasNoise) * this.width)));
            const y = Math.max(0, Math.min(this.height - 1, Math.floor(Number(cfg.canvasNoise) * this.height)));
            const image = ctx.getImageData(x, y, 1, 1);
            image.data[1] = (image.data[1] + 1) & 255;
            ctx.putImageData(image, x, y);
          }
        } catch (_) {}
        return oldToBlob.apply(this, args);
      }, 'toBlob');
    }

    const audioTouched = new WeakSet();
    const touchAudioArray = (data) => {
      if (!cfg.audioNoise || !data || audioTouched.has(data)) return data;
      try {
        audioTouched.add(data);
        const offset = Number(cfg.audioNoise) / 100000000;
        for (let i = 0; i < data.length; i += 121) data[i] += offset;
      } catch (_) {}
      return data;
    };
    if (cfg.audioNoise && window.AudioBuffer) {
      const oldGetChannelData = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = nativeLike(function(channel) {
        return touchAudioArray(oldGetChannelData.call(this, channel));
      }, 'getChannelData');
      const oldCopyFromChannel = AudioBuffer.prototype.copyFromChannel;
      if (oldCopyFromChannel) {
        AudioBuffer.prototype.copyFromChannel = nativeLike(function(destination, channelNumber, startInChannel) {
          const result = oldCopyFromChannel.call(this, destination, channelNumber, startInChannel || 0);
          touchAudioArray(destination);
          return result;
        }, 'copyFromChannel');
      }
    }

    if (cfg.audioNoise && window.OfflineAudioContext) {
      const oldStartRendering = OfflineAudioContext.prototype.startRendering;
      OfflineAudioContext.prototype.startRendering = nativeLike(function(...args) {
        const result = oldStartRendering.apply(this, args);
        if (result && typeof result.then === 'function') {
          return result.then((buffer) => {
            try {
              for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) touchAudioArray(buffer.getChannelData(channel));
            } catch (_) {}
            return buffer;
          });
        }
        return result;
      }, 'startRendering');
    }
  })();`;
}
