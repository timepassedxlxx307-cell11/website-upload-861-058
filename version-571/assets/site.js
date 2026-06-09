(function () {
  var searchToggles = document.querySelectorAll('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  searchToggles.forEach(function (button) {
    button.addEventListener('click', function () {
      if (searchPanel) {
        searchPanel.classList.toggle('is-open');
        var input = searchPanel.querySelector('input[name="q"]');
        if (searchPanel.classList.contains('is-open') && input) {
          input.focus();
        }
      }
    });
  });

  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-target]').forEach(function (input) {
    var target = document.querySelector(input.getAttribute('data-filter-target'));
    var typeSelect = document.querySelector('[data-type-filter]');
    var filter = function () {
      if (!target) {
        return;
      }
      var keyword = input.value.trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : '';
      target.querySelectorAll('[data-card-text]').forEach(function (card) {
        var haystack = (card.getAttribute('data-card-text') || '').toLowerCase();
        var cardType = card.getAttribute('data-card-type') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !type || cardType === type;
        card.classList.toggle('hidden-card', !(matchedKeyword && matchedType));
      });
    };
    input.addEventListener('input', filter);
    if (typeSelect) {
      typeSelect.addEventListener('change', filter);
    }
  });

  var resultsRoot = document.querySelector('[data-search-results]');
  if (resultsRoot && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-page-input]');
    if (searchInput) {
      searchInput.value = query;
    }
    var data = window.MOVIE_SEARCH_DATA;
    var normalized = query.toLowerCase();
    var selected = normalized
      ? data.filter(function (item) {
          return item.search.indexOf(normalized) !== -1;
        })
      : data.slice(0, 80);
    if (!selected.length) {
      resultsRoot.innerHTML = '<div class="search-empty"><strong>暂无匹配内容</strong><p>可以尝试输入影片名、地区、年份或标签。</p></div>';
    } else {
      resultsRoot.innerHTML = selected.map(renderSearchCard).join('');
    }
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card" data-card-text="', escapeAttr(item.search), '" data-card-type="', escapeAttr(item.type), '">',
      '<a href="./', escapeAttr(item.file), '">',
      '<div class="card-media"><img src="', escapeAttr(item.cover), '" alt="', escapeAttr(item.title), '" loading="lazy"><span class="card-badge">', escapeHtml(item.category), '</span><span class="play-symbol">▶</span></div>',
      '<div class="card-body"><h2 class="card-title">', escapeHtml(item.title), '</h2><p class="card-text">', escapeHtml(item.oneLine), '</p>',
      '<div class="card-meta"><span class="meta-pill">', escapeHtml(item.year), '</span><span class="meta-pill">', escapeHtml(item.region), '</span><span class="meta-pill">', escapeHtml(item.type), '</span></div>',
      '</div></a></article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var cover = document.querySelector('[data-player-cover]');
    var triggers = document.querySelectorAll('[data-player-trigger]');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hls = null;
    var attach = function () {
      if (ready || !stream) {
        return;
      }
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(player);
      } else {
        player.src = stream;
      }
      ready = true;
    };
    var start = function () {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      player.setAttribute('controls', 'controls');
      var action = player.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', start);
    });
    player.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
})();
