// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.3.3
// @icon         https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @icon64       https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @description  自动显示详细统计信息，将网速换算为 MB/s，并提供视频右上角快捷开关
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
    const STYLE_ID = 'youtube-speed-style';
    const SPEED_ID = 'youtube-speed-converted';
    let currentVideo = null;
    let completedVideo = null;
    let button = null;
    let observedSpeedValue = null;
    let speedObserver = null;

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
            if (typeof player.getVideoData === 'function' &&
                player.getVideoData()?.video_id !== videoId) return null;
        } catch (_) {
            return null;
        }
        return player;
    }

    function updateButton(player) {
        if (!button?.parentElement) return;
        const visible = player.isVideoInfoVisible();
        button.setAttribute('aria-pressed', String(visible));
        button.setAttribute('aria-label', visible ? '关闭详细统计信息' : '打开详细统计信息');
        button.title = visible ? '关闭详细统计信息' : '打开详细统计信息';
    }

    function toggleStats(event) {
        event.preventDefault();
        event.stopPropagation();

        const videoId = videoIdFromUrl();
        const player = videoId && getReadyPlayer(videoId);
        if (!player) return;

        try {
            if (player.isVideoInfoVisible()) player.hideVideoInfo();
            else player.showVideoInfo();
            completedVideo = videoId;
            updateButton(player);
        } catch (_) {
            // The player may be changing videos; the next sync will restore the button.
        }
    }

    function updateSpeedDisplay() {
        const panel = document.querySelector('.html5-video-info-panel-content, .ytp-sfn-content');
        if (!panel) {
            speedObserver?.disconnect();
            speedObserver = null;
            observedSpeedValue = null;
            return;
        }

        const row = Array.from(panel.children).find(child =>
            /^(?:Connection Speed|连接速度)$/i.test(child.firstElementChild?.textContent?.trim() || '')
        );
        const valueCell = row?.children[1];
        if (!valueCell) return;

        // Avoid a duplicate value when another converter is installed.
        if (row.querySelector('#yt-speed-converter-mbps-display')) {
            valueCell.querySelector(`#${SPEED_ID}`)?.remove();
            return;
        }

        const nativeSpeedValue = Array.from(valueCell.children).find(child =>
            child.id !== SPEED_ID && /Kbps\b/i.test(child.textContent)
        );
        if (nativeSpeedValue !== observedSpeedValue) {
            speedObserver?.disconnect();
            observedSpeedValue = nativeSpeedValue || null;
            speedObserver = observedSpeedValue ? new MutationObserver(updateSpeedDisplay) : null;
            speedObserver?.observe(observedSpeedValue, { characterData: true, childList: true, subtree: true });
        }

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
            style.id = STYLE_ID;
            style.textContent = `
                #${BUTTON_ID} {
                    position: absolute;
                    top: 20px;
                    right: 20px;
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
            // Path from YouTube's own "Stats for nerds" context-menu icon.
            path.setAttribute('d', 'M22 34h4V22h-4v12zm2-30C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm-2-22h4v-4h-4v4z');
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
        if (videoId !== currentVideo) {
            currentVideo = videoId;
            completedVideo = null;
        }

        const player = videoId && getReadyPlayer(videoId);
        if (!player) {
            button?.remove();
            return;
        }

        ensureButton(player);
        try {
            if (completedVideo !== videoId) {
                if (!player.isVideoInfoVisible()) player.showVideoInfo();
                if (player.isVideoInfoVisible()) completedVideo = videoId;
            }
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
