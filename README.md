# Userscripts

面向 [Speedtest](https://www.speedtest.net/) 和 [YouTube](https://www.youtube.com/) 的 Tampermonkey 用户脚本集合。各脚本独立维护安装地址和版本。

## 脚本概览

| 脚本 | 核心功能 | 当前版本 | 资源 |
| :--- | :--- | :--- | :--- |
| [**Speedtest Pure**](#speedtest-pure) | 精简测速页面 · 单连接模式 · 页面 IP 遮挡 | `1.0.1` | [安装](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/speedtest-pure.user.js) · [源码](./scripts/speedtest-pure.user.js) |
| [**YouTube Speed**](#youtube-speed) | 手动切换播放统计 · MB/s 网速换算 | `2.0.1` | [安装](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js) · [源码](./scripts/youtube-speed.user.js) |

## Speedtest Pure

提供测速页面精简、默认单连接模式及页面 IP 地址遮挡功能。

- **精简界面**：隐藏广告、推广和无关区块，保留测速功能、顶部导航、语言和下载菜单。
- **单连接测速**：进入测速页面时默认选择单连接模式。
- **IP 遮挡**：测速前、测速中及结果页均遮挡 IPv4/IPv6 地址的后半部分；点击地址切换完整显示与遮挡状态，悬停显示操作提示。
- **多语言页面**：适配 Speedtest 中文站及其他语言页面。

> IP 遮挡仅作用于页面显示，不影响网站获取的公网 IP 地址及测速结果。

## YouTube Speed

提供播放器内置“详细统计信息”（Stats for nerds）的快捷开关及连接速度单位换算功能。

- **适用范围**：支持普通视频、直播及站内切换视频。
- **网速换算**：原生统计面板的 Kbps 数值更新时，同步显示 MB/s 换算值，保留两位小数。
- **快捷开关**：通过视频右上角按钮打开或关闭统计面板；离开当前视频时，关闭由该按钮打开的面板。
- **控件同步**：快捷按钮随播放器进度条及播放控件同步隐藏或显示。

## 安装与更新

1. 在浏览器中安装并启用 [Tampermonkey](https://www.tampermonkey.net/)。
2. 访问脚本概览中的 **安装** 链接，在 Tampermonkey 中确认安装。
3. 访问对应网站，脚本按匹配规则自动执行。

各脚本的 `@updateURL` 和 `@downloadURL` 均指向本仓库。Tampermonkey 根据更新检查配置获取后续版本。安装链接显示源码时，可通过 Tampermonkey 的 URL 导入功能安装。

## 项目信息

源代码位于 [`scripts/`](./scripts/)。问题报告与功能建议通过 [GitHub Issues](https://github.com/haoch1/userscripts/issues) 提交。项目采用 [MIT License](./LICENSE)。
