(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-button]");
    var status = player.querySelector("[data-player-status]");
    var source = video ? video.dataset.src : "";
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    async function initialize() {
      if (!video || initialized) {
        return;
      }
      initialized = true;

      if (!source) {
        setStatus("当前影片暂无可用播放源");
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("已加载播放源，正在准备播放");
        return;
      }

      try {
        var module = await import("./hls-vendor-dru42stk.js");
        var Hls = module.H;
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪，点击画面或控制栏可继续播放");
          });
          hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus("播放源加载异常，请稍后重试");
            }
          });
        } else {
          video.src = source;
          setStatus("浏览器将尝试直接播放该 m3u8 源");
        }
      } catch (error) {
        video.src = source;
        setStatus("HLS 组件加载失败，浏览器将尝试直接播放");
      }
    }

    async function play() {
      await initialize();
      if (!video) {
        return;
      }
      try {
        await video.play();
        if (button) {
          button.classList.add("is-hidden");
        }
      } catch (error) {
        setStatus("浏览器阻止了自动播放，请再次点击播放按钮");
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("error", function () {
        setStatus("播放器无法读取当前播放源，请检查网络或更换源地址");
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
