// ==UserScript==
// @name         YouTube Speed
// @namespace    https://github.com/haoch1/userscripts
// @version      1.0.2
// @icon         https://www.youtube.com/favicon.ico
// @description  打开 YouTube 视频时自动显示播放器的“详细统计信息”
// @downloadURL  https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-stats-for-nerds.user.js
// @updateURL    https://raw.githubusercontent.com/haoch1/userscripts/main/scripts/youtube-stats-for-nerds.user.js
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @grant        none
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
    'use strict';

    const RETRY_MS = 250;
    const MAX_ATTEMPTS = 240;
    let timer = null;
    let attempts = 0;
    let currentVideo = null;
    let completedVideo = null;

    function videoIdFromUrl() {
        const url = new URL(location.href);
        if (url.pathname === '/watch') return url.searchParams.get('v');

        const match = url.pathname.match(/^\/live\/([^/]+)/);
        return match?.[1] || null;
    }

    function stopRetrying() {
        if (timer !== null) clearTimeout(timer);
        timer = null;
    }

    function tryShowStats() {
        timer = null;
        const videoId = videoIdFromUrl();
        if (!videoId || videoId !== currentVideo || videoId === completedVideo) return;

        const player = document.getElementById('movie_player');
        try {
            if (typeof player?.showVideoInfo === 'function' &&
                typeof player.isVideoInfoVisible === 'function') {
                const videoReady = typeof player.getVideoData !== 'function' ||
                    player.getVideoData()?.video_id === videoId;
                if (videoReady) {
                    if (!player.isVideoInfoVisible()) player.showVideoInfo();
                    if (player.isVideoInfoVisible()) {
                        completedVideo = videoId;
                        return;
                    }
                }
            }
        } catch (_) {
            // The player may still be initializing; retry until it is ready.
        }

        if (++attempts < MAX_ATTEMPTS) {
            timer = setTimeout(tryShowStats, RETRY_MS);
        }
    }

    function onNavigation() {
        const videoId = videoIdFromUrl();
        if (videoId === currentVideo) return;

        stopRetrying();
        currentVideo = videoId;
        completedVideo = null;
        attempts = 0;
        if (videoId) tryShowStats();
    }

    document.addEventListener('yt-navigate-finish', onNavigation);
    document.addEventListener('DOMContentLoaded', onNavigation, { once: true });
    onNavigation();
})();
