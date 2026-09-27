# Userscripts

两个可独立安装、自动更新的 Tampermonkey 用户脚本：**Speedtest Pure** 精简测速页面并保护 IP 信息，**YouTube Speed** 自动显示播放统计信息并换算网速。

## 脚本一览

| 脚本 | 适用网站 | 版本 | 安装 |
| --- | --- | --- | --- |
| [Speedtest Pure](./scripts/speedtest-pure.user.js) | [Speedtest](https://www.speedtest.net/) | `1.0.1` | [安装脚本](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/speedtest-pure.user.js) |
| [YouTube Speed](./scripts/youtube-speed.user.js) | [YouTube](https://www.youtube.com/) | `1.3.7` | [安装脚本](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js) |

## 功能

### Speedtest Pure

- 隐藏广告、推广和无关区块，保留测速功能、顶部导航、语言与下载菜单。
- 默认使用单连接测速模式。
- 在测速前、测速中和结果页遮挡 IPv4/IPv6 地址的后半部分；点击 IP 可切换完整地址，悬停可查看操作提示。
- 支持 Speedtest 中文站及其他语言页面。

### YouTube Speed

- 打开普通视频、直播或在站内切换视频时，自动显示播放器内置的“详细统计信息”。
- 将统计信息中的连接速度从 Kbps 换算为 MB/s，保留两位小数。
- 在视频右上角提供快捷按钮；手动关闭统计信息后，当前视频不会再次自动打开。
- 播放控件自动隐藏时按钮同步隐藏，控件出现时恢复。

## 安装与更新

1. 安装并启用 [Tampermonkey](https://www.tampermonkey.net/)。
2. 在上表点击对应的“安装脚本”，并在 Tampermonkey 中确认安装。
3. 打开对应网站即可使用。脚本通过元数据中的 `@downloadURL` 和 `@updateURL` 从本仓库获取更新。

如果安装页面没有出现，可复制安装链接，在 Tampermonkey 的“添加新脚本”页面打开。

## 维护

脚本位于 [`scripts/`](./scripts/)，文件名使用小写短横线和 `.user.js` 后缀。新增脚本时，请设置名称、版本、适用网站、许可证以及指向脚本文件的 `@downloadURL` 和 `@updateURL`，并同步更新上方的脚本一览和功能说明。

本仓库采用 [MIT License](./LICENSE)。
