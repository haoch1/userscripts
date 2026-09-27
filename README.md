# Userscripts

用于维护和分发 Tampermonkey 用户脚本的公共仓库。每个脚本独立存放在 `scripts/` 目录，并通过 GitHub Raw 提供安装和自动更新地址。

## 可用脚本

### Speedtest Pure

针对 [Speedtest](https://www.speedtest.net/) 的轻量化界面脚本。

- 精简测速页面，隐藏广告、推广内容和无关页面区块
- 默认使用单连接测速模式
- 测速前、测速中和结果页持续隐藏 IPv4/IPv6 地址的后半部分
- 点击 IP 可在掩码和完整地址之间切换，悬停显示操作提示
- 保留顶部导航、语言、下载菜单以及测速核心功能
- 支持 Speedtest 中文站及其他语言页面

| 项目 | 信息 |
| --- | --- |
| 当前版本 | `1.0.0` |
| 脚本文件 | [`scripts/speedtest-pure.user.js`](./scripts/speedtest-pure.user.js) |
| 适用网站 | `https://www.speedtest.net/*`、`https://speedtest.net/*` |
| 许可证 | [MIT](./LICENSE) |

**[安装 Speedtest Pure](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/speedtest-pure.user.js)**

### YouTube Speed

打开 YouTube 视频时自动显示播放器内置的“详细统计信息”（Stats for nerds），并将其中的连接速度从 Kbps 实时换算为 MB/s（保留两位小数）。视频画面右上角提供一个小型“i”按钮，可随时打开或关闭；图标取自 YouTube 自带的“详细统计信息”菜单项。支持普通视频、直播和站内切换视频。手动关闭后不会在当前视频反复弹出。

| 项目 | 信息 |
| --- | --- |
| 当前版本 | `1.3.3` |
| 脚本文件 | [`scripts/youtube-speed.user.js`](./scripts/youtube-speed.user.js) |
| 适用网站 | `https://www.youtube.com/*`、`https://youtube.com/*` |
| 许可证 | [MIT](./LICENSE) |

**[安装 YouTube Speed](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js)**

## 安装

1. 在浏览器中安装 [Tampermonkey](https://www.tampermonkey.net/) 并启用扩展。
2. 点击脚本对应的安装链接。
3. 在 Tampermonkey 安装页面确认脚本信息，选择“安装”。
4. 打开匹配的网站，脚本会自动运行。

## 自动更新

脚本元数据中包含 `@downloadURL` 和 `@updateURL`，地址指向对应文件的 GitHub Raw 链接。Tampermonkey 会按照扩展的更新检查设置获取新版本。

如果浏览器没有弹出安装页面，可以复制脚本的 Raw 地址，在 Tampermonkey 的“添加新脚本”页面中打开，或直接将文件内容粘贴进去。

## 仓库结构

```text
userscripts/
├── scripts/
│   ├── speedtest-pure.user.js
│   └── youtube-speed.user.js
├── LICENSE
└── README.md
```

## 新增脚本规范

新增脚本时，请将文件放入 `scripts/`，使用小写短横线命名，并采用 `.user.js` 后缀。脚本头部应至少包含以下元数据：

```javascript
// @name         Script Name
// @namespace    https://example.com/
// @version      1.0.0
// @description  Script description
// @match        https://example.com/*
// @downloadURL  https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/example.user.js
// @updateURL    https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/example.user.js
```

提交新脚本时，同时在本文件的“可用脚本”部分补充用途、适用网站、当前版本和安装链接，确保每个脚本都能独立安装和更新。

## 许可证

本仓库以 [MIT License](./LICENSE) 发布。各脚本如有额外许可要求，会在脚本元数据或对应文档中单独说明。
