# Userscripts

这里集中维护个人篡改猴（Tampermonkey）用户脚本。脚本统一放在 [`scripts/`](./scripts) 目录，后续可以继续添加其他网站脚本。

## 脚本列表

| 脚本 | 说明 | 安装 |
| --- | --- | --- |
| [Speedtest Pure](./scripts/speedtest-pure.user.js) | 精简 Speedtest 测速界面，默认单连接；IP 点击显示/隐藏，支持 IPv4/IPv6 | [安装到篡改猴](https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/speedtest-pure.user.js) |

## 安装方式

1. 安装并启用 [篡改猴（Tampermonkey）](https://www.tampermonkey.net/)。
2. 点击上表中的“安装到篡改猴”链接。
3. 在篡改猴安装页面确认脚本信息并点击安装。

脚本内置 `@downloadURL` 和 `@updateURL`，后续发布新版本时，篡改猴可以从 GitHub Raw 地址检查更新。

## 目录结构

```text
userscripts/
├─ scripts/
│  └─ speedtest-pure.user.js
├─ LICENSE
└─ README.md
```

