(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-mobile-menu]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
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
      }
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupPageFilter() {
    var filterRoot = document.querySelector("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
    var typeSelect = filterRoot.querySelector("[data-filter-type]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var cards = Array.from(document.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var keyword = normalizeText(keywordInput && keywordInput.value);
      var type = normalizeText(typeSelect && typeSelect.value);
      var year = normalizeText(yearSelect && yearSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesType = !type || normalizeText(card.dataset.type) === type;
        var matchesYear = !year || normalizeText(card.dataset.year) === year;
        var visible = matchesKeyword && matchesType && matchesYear;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      var counter = document.querySelector("[data-filter-count]");
      if (counter) {
        counter.textContent = String(visibleCount);
      }
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a href="./' + escapeHtml(movie.url) + '">',
      '    <div class="poster-frame">',
      '      <span class="poster-fallback">国产福利影视</span>',
      '      <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
      '      <span class="badge">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.genre) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root) {
      return;
    }

    var form = root.querySelector("[data-search-form]");
    var input = root.querySelector("[data-search-input]");
    var results = root.querySelector("[data-search-results]");
    var count = root.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var allMovies = [];

    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var keyword = normalizeText(query);
      var matched = allMovies.filter(function (movie) {
        var haystack = normalizeText([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.one_line
        ].join(" "));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (count) {
        count.textContent = String(matched.length);
      }

      if (!results) {
        return;
      }

      if (!matched.length) {
        results.innerHTML = '<div class="result-empty">没有找到匹配影片，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = matched.map(movieCardTemplate).join("");
      setupImageFallbacks();
    }

    fetch("./assets/movies.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (items) {
        allMovies = items;
        render(initialQuery);
      })
      .catch(function () {
        if (results) {
          results.innerHTML = '<div class="result-empty">搜索索引加载失败，请直接通过分类页浏览影片。</div>';
        }
      });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value : "";
        var nextUrl = new URL(window.location.href);
        if (query.trim()) {
          nextUrl.searchParams.set("q", query.trim());
        } else {
          nextUrl.searchParams.delete("q");
        }
        window.history.replaceState({}, "", nextUrl.toString());
        render(query);
      });
    }
  }

  ready(function () {
    setupImageFallbacks();
    setupMobileMenu();
    setupHeroSlider();
    setupPageFilter();
    setupSearchPage();
  });
})();
