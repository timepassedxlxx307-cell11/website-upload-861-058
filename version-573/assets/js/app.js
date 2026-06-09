(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navigation = document.querySelector('[data-site-nav]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      navigation.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.cover-image').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-hidden');
    });
  });

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-list]').forEach(function (list) {
    var scope = list.closest('section') || document;
    var input = scope.querySelector('[data-filter-input]');
    var tabButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var activeValue = '';
    var cards = Array.prototype.slice.call(list.querySelectorAll('.filter-item'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matchCard(card, query, tab) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var queryMatched = !query || haystack.indexOf(query) !== -1;
      var tabMatched = !tab || haystack.indexOf(tab) !== -1;
      return queryMatched && tabMatched;
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var tab = normalize(activeValue);

      cards.forEach(function (card) {
        card.classList.toggle('is-filtered', !matchCard(card, query, tab));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || '';
        tabButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-button]');
    var state = shell.querySelector('[data-player-state]');
    var hlsInstance = null;

    function setState(message) {
      if (state) {
        state.textContent = message || '';
      }
    }

    function attachStream() {
      if (!video || video.getAttribute('data-ready') === 'true') {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        setState('视频暂时无法加载');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      if (!video) {
        return;
      }

      attachStream();

      if (button) {
        button.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
          setState('请再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setState('');
      });

      video.addEventListener('error', function () {
        setState('视频暂时无法加载');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
