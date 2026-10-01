// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.3.9
// @icon         https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @icon64       https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @description  每个视频默认关闭详细统计信息，通过快捷按钮开启；网速换算为 MB/s，按钮随播放控件隐显
// @downloadURL  https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js
// @updateURL    https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-speed.user.js
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @grant        none
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
    'use strict';

    const BUTTON_ID = 'youtube-speed-toggle';
    const SPEED_ID = 'youtube-speed-converted';
    // Icon used by YouTube's "Stats for nerds" context-menu item.
    const ICON_PATH = 'M22 34h4V22h-4v12zm2-30C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm-2-22h4v-4h-4v4z';
    let button = null;
    let openedVideoId = null;
    let observedSpeedValue = null;
    const speedObserver = new MutationObserver(updateSpeedDisplay);

    function videoIdFromUrl() {
        const url = new URL(location.href);
        if (url.pathname === '/watch') return url.searchParams.get('v');

        const match = url.pathname.match(/^\/live\/([^/]+)/);
        return match?.[1] || null;
    }

    function getReadyPlayer(videoId) {
        const player = document.getElementById('movie_player');
        if (typeof player?.showVideoInfo !== 'function' ||
            typeof player.hideVideoInfo !== 'function' ||
            typeof player.isVideoInfoVisible !== 'function') return null;

        try {
            if (videoId && typeof player.getVideoData === 'function' &&
                player.getVideoData()?.video_id !== videoId) return null;
        } catch (_) {
            return null;
        }
        return player;
    }

    function updateButton(player) {
        const visible = player.isVideoInfoVisible();
        const label = `${visible ? '关闭' : '打开'}详细统计信息`;
        button.setAttribute('aria-pressed', String(visible));
        button.setAttribute('aria-label', label);
        button.title = label;
    }

    function toggleStats(event) {
        event.preventDefault();
        event.stopPropagation();

        const videoId = videoIdFromUrl();
        const player = videoId && getReadyPlayer(videoId);
        if (!player) return;

        try {
            const visible = player.isVideoInfoVisible();
            if (visible) player.hideVideoInfo();
            else player.showVideoInfo();
            openedVideoId = visible ? null : videoId;
            updateButton(player);
        } catch (_) {
            // The player may be changing videos; the next sync will restore the button.
        }
    }

    function observeSpeedValue(value) {
        if (value === observedSpeedValue) return;
        speedObserver.disconnect();
        observedSpeedValue = value;
        if (value) speedObserver.observe(value, { characterData: true, childList: true, subtree: true });
    }

    function updateSpeedDisplay() {
        const panel = document.querySelector('.html5-video-info-panel-content, .ytp-sfn-content');
        if (!panel) {
            observeSpeedValue(null);
            return;
        }

        const row = Array.from(panel.children).find(child =>
            /^(?:Connection Speed|连接速度)$/i.test(child.firstElementChild?.textContent?.trim() || '')
        );
        const valueCell = row?.children[1];
        if (!valueCell) {
            observeSpeedValue(null);
            return;
        }

        // Avoid a duplicate value when another converter is installed.
        if (row.querySelector('#yt-speed-converter-mbps-display')) {
            valueCell.querySelector(`#${SPEED_ID}`)?.remove();
            observeSpeedValue(null);
            return;
        }

        const nativeSpeedValue = Array.from(valueCell.children).find(child =>
            child.id !== SPEED_ID && /Kbps\b/i.test(child.textContent)
        );
        observeSpeedValue(nativeSpeedValue || null);

        const match = (nativeSpeedValue || valueCell).textContent.match(/([\d,]+(?:\.\d+)?)\s*Kbps\b/i);
        if (!match) return;
        const kbps = Number(match[1].replaceAll(',', ''));
        if (!Number.isFinite(kbps)) return;

        let converted = valueCell.querySelector(`#${SPEED_ID}`);
        if (!converted) {
            converted = document.createElement('span');
            converted.id = SPEED_ID;
            converted.style.cssText = 'margin-left:6px;color:#63c9ff;font-weight:600;white-space:nowrap;';
            valueCell.appendChild(converted);
        }
        converted.textContent = `(${(kbps / 8192).toFixed(2)} MB/s)`;
    }

    function ensureButton(player) {
        if (!button) {
            const style = document.createElement('style');
            style.textContent = `
                #${BUTTON_ID} {
                    position: absolute;
                    top: 32px;
                    right: 32px;
                    z-index: 1000;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border: 0;
                    border-radius: 5px;
                    background: rgba(0, 0, 0, .62);
                    color: #fff;
                    cursor: pointer;
                    opacity: .9;
                    outline: none;
                    pointer-events: auto;
                    transition: background-color .15s ease, opacity .15s ease;
                }
                #${BUTTON_ID}[aria-pressed="true"] {
                    background: rgba(70, 70, 70, .88);
                    opacity: 1;
                }
                #${BUTTON_ID}:hover,
                #${BUTTON_ID}:focus-visible {
                    background: rgba(90, 90, 90, .94);
                    opacity: 1;
                }
                #${BUTTON_ID} svg {
                    display: block;
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                }
                #movie_player.ytp-autohide #${BUTTON_ID} {
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `;
            (document.head || document.documentElement).appendChild(style);

            button = document.createElement('button');
            button.id = BUTTON_ID;
            button.type = 'button';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 48 48');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', ICON_PATH);
            svg.appendChild(path);
            button.appendChild(svg);
            button.addEventListener('click', toggleStats);
            for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'keydown']) {
                button.addEventListener(type, event => event.stopPropagation());
            }
        }
        if (button.parentElement !== player) player.appendChild(button);
    }

    function sync() {
        updateSpeedDisplay();
        const videoId = videoIdFromUrl();
        if (openedVideoId !== videoId) openedVideoId = null;
        const player = getReadyPlayer();
        if (!player) {
            button?.remove();
            return;
        }

        try {
            // Close inherited stats even while the next video is still loading.
            if (!openedVideoId && player.isVideoInfoVisible()) player.hideVideoInfo();
            if (!player.isVideoInfoVisible()) openedVideoId = null;
            if (!videoId || !getReadyPlayer(videoId)) {
                button?.remove();
                return;
            }
            ensureButton(player);
            updateButton(player);
        } catch (_) {
            // Retry when YouTube finishes initializing or replacing the player.
        }
    }

    document.addEventListener('yt-navigate-finish', sync);
    document.addEventListener('DOMContentLoaded', sync, { once: true });
    setInterval(sync, 750);
    sync();
})();
