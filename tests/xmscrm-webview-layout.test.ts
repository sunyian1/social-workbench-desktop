import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('XMSCRM style webview layout', () => {
  it('keeps tab strip and right CRM tools visible while webview is open', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/main/services/BrowserManager.ts'), 'utf8');
    expect(source).toContain('x: 58');
    expect(source).toContain('y: 42');
    expect(source).toContain('width - 134');
    expect(source).toContain('height - 42');
  });

  it('renders app tabs, plus button, and CRM tool panel in renderer', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/renderer/App.tsx'), 'utf8');
    expect(source).toContain('function AppTabs');
    expect(source).toContain('翻译设置');
    expect(source).toContain('快捷回复');
    expect(source).toContain('客户信息');
    expect(source).toContain('代理设置');
    expect(source).toContain('暂无打开的应用');
  });
});
