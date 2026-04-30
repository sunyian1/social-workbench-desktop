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
    const chromeRuntime = { runtime: {} };
    try {
      if (!window.chrome) Object.defineProperty(window, 'chrome', { get: () => chromeRuntime, configurable: true });
    } catch (_) {}
    if (cfg.timezone && Intl && Intl.DateTimeFormat) {
      const old = Intl.DateTimeFormat.prototype.resolvedOptions;
      Intl.DateTimeFormat.prototype.resolvedOptions = function() {
        return { ...old.call(this), timeZone: cfg.timezone };
      };
    }
  })();`;
}
