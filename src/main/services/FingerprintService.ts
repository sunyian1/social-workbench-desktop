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
        return { ...old.call(this), timeZone: cfg.timezone };
      };
    }

    if (cfg.webglVendor || cfg.webglRenderer) {
      const oldGetParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445 && cfg.webglVendor) return cfg.webglVendor;
        if (parameter === 37446 && cfg.webglRenderer) return cfg.webglRenderer;
        return oldGetParameter.call(this, parameter);
      };
      if (window.WebGL2RenderingContext) {
        const oldGetParameter2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445 && cfg.webglVendor) return cfg.webglVendor;
          if (parameter === 37446 && cfg.webglRenderer) return cfg.webglRenderer;
          return oldGetParameter2.call(this, parameter);
        };
      }
    }

    if (cfg.canvasNoise) {
      const oldToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        try {
          const ctx = this.getContext('2d');
          if (ctx && this.width && this.height) {
            const x = Math.min(this.width - 1, Math.floor(Number(cfg.canvasNoise) * this.width));
            const y = Math.min(this.height - 1, Math.floor(Number(cfg.canvasNoise) * this.height));
            ctx.fillStyle = 'rgba(1,1,1,0.01)';
            ctx.fillRect(Math.max(0, x), Math.max(0, y), 1, 1);
          }
        } catch (_) {}
        return oldToDataURL.apply(this, args);
      };
    }

    if (cfg.audioNoise && window.AudioBuffer) {
      const oldGetChannelData = AudioBuffer.prototype.getChannelData;
      AudioBuffer.prototype.getChannelData = function(channel) {
        const data = oldGetChannelData.call(this, channel);
        try {
          const offset = Number(cfg.audioNoise) / 100000;
          for (let i = 0; i < data.length; i += 100) data[i] += offset;
        } catch (_) {}
        return data;
      };
    }
  })();`;
}
