(function () {
    function setupPlayer(root) {
        var video = root.querySelector('.js-player-video');
        var playButton = root.querySelector('.js-play');
        var status = root.querySelector('.js-player-status');
        var src = root.getAttribute('data-video-src');
        var hls = null;
        var ready = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function prepare() {
            if (!video || !src || ready) {
                return;
            }

            ready = true;
            setStatus('');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('视频暂时无法播放');
                    }
                });
                return;
            }

            video.src = src;
        }

        function playOrPause() {
            if (!video) {
                return;
            }

            prepare();

            if (video.paused) {
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        setStatus('视频加载中，请稍候');
                    });
                }
            } else {
                video.pause();
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playOrPause);
        }

        if (video) {
            video.addEventListener('click', playOrPause);
            video.addEventListener('play', function () {
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
                setStatus('');
            });
            video.addEventListener('pause', function () {
                if (playButton && !video.ended) {
                    playButton.classList.remove('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (playButton) {
                    playButton.classList.remove('is-hidden');
                }
            });
            prepare();
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.js-player').forEach(setupPlayer);
}());
