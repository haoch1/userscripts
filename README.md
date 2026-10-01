# Userscripts

为 [Speedtest](https://www.speedtest.net/) 和 [YouTube](https://www.youtube.com/) 提供两款独立的 Tampermonkey 用户脚本。每款脚本都有自己的安装地址和更新版本，可按需使用。

## 选择脚本

| 脚本 | 核心用途 | 当前版本 | 操作 |
| :--- | :--- | :--- | :--- |
| [**Speedtest Pure**](#speedtest-pure) | 精简测速页面 · 单连接模式 · 页面 IP 遮挡 | `1.0.1` | [安装](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/speedtest-pure.user.js) · [源码](./scripts/speedtest-pure.user.js) |
| [**YouTube Speed**](#youtube-speed) | 手动切换播放统计 · MB/s 网速换算 | `2.0.0` | [安装](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js) · [源码](./scripts/youtube-speed.user.js) |

## Speedtest Pure

保留测速所需的内容，减少页面干扰，并在页面上遮挡容易被截图或录屏带出的 IP 地址。

- **精简界面**：隐藏广告、推广和无关区块，保留测速功能、顶部导航、语言和下载菜单。
- **单连接测速**：进入测速页面时默认选择单连接模式。
- **IP 遮挡**：测速前、测速中及结果页均遮挡 IPv4/IPv6 地址的后半部分；点击地址可切换完整显示，悬停可查看操作提示。
- **多语言页面**：适配 Speedtest 中文站及其他语言页面。

> IP 遮挡仅改变页面显示，不会改变网站获取到的公网 IP 或测速结果。

## YouTube Speed

通过视频右上角的快捷按钮，手动打开或关闭播放器内置的“详细统计信息”（Stats for nerds），并把连接速度换算成更直观的 MB/s。

- **适用范围**：支持普通视频、直播及站内切换视频。
- **网速换算**：将统计面板中的 Kbps 数值转换为 MB/s，保留两位小数。
- **快捷开关**：点击按钮打开或关闭统计面板；离开当前视频时，关闭由快捷按钮打开的面板。
- **跟随控件**：进度条和播放控件自动隐藏时，按钮同步隐藏；控件出现时恢复。

## 安装与更新

1. 在浏览器中安装并启用 [Tampermonkey](https://www.tampermonkey.net/)。
2. 点击上表对应脚本的 **安装** 链接，在 Tampermonkey 中确认安装。
3. 打开对应网站，脚本会自动运行。

两个脚本均通过各自的 `@updateURL` 和 `@downloadURL` 指向本仓库。后续更新由 Tampermonkey 按其检查设置获取；如果安装链接只显示源码，可复制该链接并在 Tampermonkey 中导入。

## 项目信息

源码位于 [`scripts/`](./scripts/)；发现问题或提出建议可使用 [Issues](https://github.com/haoch1/userscripts/issues)。本仓库采用 [MIT License](./LICENSE)。
