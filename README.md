# Social Workbench Desktop

一个从零编写的 Electron 多账号社媒工作台 MVP，参考 `MrJack351/electron-desktop` 的多会话思路，但没有直接复制其代码。

## 已支持平台

- Telegram Web A：`https://web.telegram.org/a/`
- Telegram Web K：`https://web.telegram.org/k/`
- WhatsApp Web：`https://web.whatsapp.com/`
- Instagram：`https://www.instagram.com/`
- Facebook：`https://www.facebook.com/`

## 核心能力

- 每个 Profile 独立 Electron `partition: persist:profile:<id>`，Cookie / LocalStorage / IndexedDB 互不影响。
- 左侧 Profile 列表，右侧内嵌网页工作区。
- Profile CRUD。
- Proxy CRUD，并可给 Profile 绑定代理。
- 通过 `proxy-chain` 建立本地中转代理，再对 Electron session 调用 `setProxy`。
- 基础指纹参数：User-Agent、语言、平台、时区、硬件并发数、deviceMemory，通过 preload 注入常见 navigator 字段。
- 严格主界面安全默认值：`nodeIntegration: false`、`contextIsolation: true`、`sandbox: true`。
- Cookie 不明文写入 SQLite，只存 Profile / Proxy / Fingerprint 元信息。

## 开发运行

```bash
npm install
npm run electron:dev
```

## 构建

```bash
npm run build
npm run dist
```

## 项目结构

```text
src/main/              Electron 主进程
src/main/services/     Profile / Proxy / Browser / Fingerprint 服务
src/main/preload/      主界面 IPC preload + 网页视图 profile preload
src/renderer/          React + Chakra UI 管理界面
src/shared/            前后端共享类型
src/platform-scripts/  平台脚本占位目录
```

## 合规说明

本项目用于用户自有账号的多会话管理。不要用于绕过平台规则、批量滥用、窃取 Cookie/Token 或未授权自动化。
