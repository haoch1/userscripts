// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.1.0
// @icon         https://www.youtube.com/favicon.ico
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

    function ensureButton(player) {
        if (!button) {
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = `
                #${BUTTON_ID} {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    z-index: 1000;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    min-width: 38px;
                    height: 24px;
                    padding: 0 7px;
                    border: 1px solid rgba(255, 255, 255, .45);
                    border-radius: 5px;
                    background: rgba(0, 0, 0, .72);
                    color: #fff;
                    font: 12px/1 sans-serif;
                    cursor: pointer;
                    opacity: .8;
                    pointer-events: auto;
                }
                #${BUTTON_ID}:hover, #${BUTTON_ID}:focus-visible { opacity: 1; }
                #${BUTTON_ID}:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
                #${BUTTON_ID}[aria-pressed="true"] { background: rgba(180, 0, 0, .88); }
            `;
            (document.head || document.documentElement).appendChild(style);

            button = document.createElement('button');
            button.id = BUTTON_ID;
            button.type = 'button';
            button.textContent = '统计';
            button.addEventListener('click', toggleStats);
            for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'keydown']) {
                button.addEventListener(type, event => event.stopPropagation());
            }
        }
        if (button.parentElement !== player) player.appendChild(button);
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
