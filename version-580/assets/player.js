(function () {
  window.initMoviePlayer = function (videoId, buttonId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var ready = false;

    if (!video || !button || !mediaUrl) {
      return;
    }

    var prepare = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    };

    var play = function () {
      prepare();
      button.classList.add('is-hidden');
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
