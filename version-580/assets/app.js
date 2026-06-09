(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SiteMovieIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = searchPage.querySelector('[data-search-input]');
    var title = searchPage.querySelector('[data-search-title]');
    var results = searchPage.querySelector('[data-search-results]');
    if (input) {
      input.value = query;
    }
    var makeCard = function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card card-hover silver-border">' +
        '<a class="poster-link" href="' + movie.href + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="score-badge">' + escapeHtml(movie.score) + '</span>' +
        '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</article>';
    };
    if (query) {
      var lower = query.toLowerCase();
      var matched = window.SiteMovieIndex.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
        return text.indexOf(lower) !== -1;
      }).slice(0, 96);
      if (title) {
        title.textContent = matched.length ? '与“' + query + '”相关的影片' : '未找到相关影片';
      }
      if (results) {
        results.innerHTML = matched.length ? matched.map(makeCard).join('') : window.SiteMovieIndex.slice(0, 12).map(makeCard).join('');
      }
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }
})();
