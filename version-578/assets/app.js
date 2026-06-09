(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function reset() {
      window.clearInterval(timer);
      play();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }

    play();
  }

  function setupCategoryFilter() {
    var list = document.querySelector('[data-filter-list]');
    var input = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var count = document.querySelector('[data-filter-count]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedRegion = !region || card.getAttribute('data-region') === region;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matched = matchedKeyword && matchedRegion && matchedYear;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    [input, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  function buildSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="movie-card__poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-fallback">国产影视综合网</span>',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">',
      '    <span class="movie-card__quality">HD</span>',
      '    <span class="movie-card__score">★ ' + escapeHtml(movie.rating) + '</span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <a class="movie-card__title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
      '    <p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-card__tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var count = document.querySelector('[data-search-result-count]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!results || !form || !input || !index.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    input.value = initialQuery;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matched = index.filter(function (movie) {
        if (!normalized) {
          return true;
        }

        return movie.searchText.indexOf(normalized) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(buildSearchCard).join('\n');

      if (count) {
        count.textContent = normalized ? '找到 ' + matched.length + ' 部相关影片' : '默认展示 ' + matched.length + ' 部影片';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      render(query);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function setupPlayer() {
    var video = document.querySelector('[data-hls-player]');
    var startButton = document.querySelector('[data-player-start]');

    if (!video || !startButton) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance;
    var loaded = false;

    function attachAndPlay() {
      if (!source) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        loaded = true;
      }

      startButton.classList.add('is-hidden');
      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          startButton.classList.remove('is-hidden');
        });
      }
    }

    startButton.addEventListener('click', attachAndPlay);
    video.addEventListener('play', function () {
      startButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        startButton.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
