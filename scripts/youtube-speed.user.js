// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.3.0
// @icon         https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @icon64       https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @description  自动显示详细统计信息，将网速换算为 MB/s，并提供播放器快捷开关
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

    function ensureButton(controls) {
        if (!button) {
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = `
                #${BUTTON_ID}.ytp-button {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 38px;
                    height: 100%;
                    padding: 0;
                    border: 0;
                    border-radius: 8px;
                    background: transparent;
                    color: #fff;
                    cursor: pointer;
                    pointer-events: auto;
                    transition: background-color .15s ease;
                }
                #${BUTTON_ID}.ytp-button:hover,
                #${BUTTON_ID}.ytp-button:focus-visible {
                    background: rgba(255, 255, 255, .14);
                }
                #${BUTTON_ID}.ytp-button:focus-visible {
                    outline: 2px solid #fff;
                    outline-offset: -3px;
                }
                #${BUTTON_ID} svg {
                    display: block;
                    width: 20px;
                    height: 20px;
                    fill: none;
                    stroke: currentColor;
                    stroke-width: 2;
                    stroke-linecap: round;
                }
                #${BUTTON_ID}[aria-pressed="true"]::after {
                    content: '';
                    position: absolute;
                    top: 8px;
                    right: 4px;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #ff4e45;
                    box-shadow: 0 0 0 2px rgba(0, 0, 0, .5);
                }
            `;
            (document.head || document.documentElement).appendChild(style);

            button = document.createElement('button');
            button.id = BUTTON_ID;
            button.className = 'ytp-button';
            button.type = 'button';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M4 19.5h16M6 17v-4m4 4V9m4 8v-5m4 5V6');
            svg.appendChild(path);
            button.appendChild(svg);
            button.addEventListener('click', toggleStats);
            for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'keydown']) {
                button.addEventListener(type, event => event.stopPropagation());
            }
        }
        if (button.parentElement !== controls) controls.insertBefore(button, controls.firstChild);
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

        const controls = player.querySelector('.ytp-right-controls');
        if (controls) ensureButton(controls);
        else button?.remove();
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
