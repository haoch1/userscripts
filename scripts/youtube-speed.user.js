// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.2.0
// @icon         https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @icon64       https://www.youtube.com/s/desktop/af0a3c1e/img/favicon_144x144.png
// @description  打开视频时显示详细统计信息，并提供播放器内快捷开关
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
    let currentVideo = null;
    let completedVideo = null;
    let button = null;

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
            button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 19.5h16M6 17v-4m4 4V9m4 8v-5m4 5V6"/></svg>';
            button.addEventListener('click', toggleStats);
            for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'keydown']) {
                button.addEventListener(type, event => event.stopPropagation());
            }
        }
        if (button.parentElement !== controls) controls.insertBefore(button, controls.firstChild);
    }

    function sync() {
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
