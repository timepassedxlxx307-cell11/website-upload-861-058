(function() {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNav() {
    var toggle = one("[data-nav-toggle]");
    var nav = one("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = one("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = one("[data-hero-prev]", hero);
    var next = one("[data-hero-next]", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCardFilters() {
    all("[data-card-filter]").forEach(function(panel) {
      var section = panel.parentElement;
      var list = section ? one("[data-card-list]", section) : null;
      var cards = list ? all(".movie-card", list) : [];
      if (!cards.length) {
        return;
      }
      var input = one("[data-filter-input]", panel);
      var type = one("[data-filter-type]", panel);
      var region = one("[data-filter-region]", panel);
      var year = one("[data-filter-year]", panel);

      function match(card) {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var title = normalize(card.getAttribute("data-title"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var genre = normalize(card.getAttribute("data-genre"));
        var text = [title, cardType, cardRegion, cardYear, genre].join(" ");
        return (!keyword || text.indexOf(keyword) !== -1)
          && (!typeValue || cardType === typeValue)
          && (!regionValue || cardRegion === regionValue)
          && (!yearValue || cardYear === yearValue);
      }

      function update() {
        cards.forEach(function(card) {
          card.classList.toggle("hidden-card", !match(card));
        });
      }

      [input, type, region, year].forEach(function(el) {
        if (el) {
          el.addEventListener("input", update);
          el.addEventListener("change", update);
        }
      });
    });
  }

  function uniqueOptions(movies, key) {
    var values = [];
    movies.forEach(function(movie) {
      var value = movie[key];
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function(a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.slice(0, 120).forEach(function(value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"card-play\">播放</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine || "") + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var page = one("[data-search-page]");
    if (!page || !window.SITE_MOVIES) {
      return;
    }
    var movies = window.SITE_MOVIES;
    var input = one("[data-search-input]", page);
    var type = one("[data-search-type]", page);
    var region = one("[data-search-region]", page);
    var year = one("[data-search-year]", page);
    var results = one("[data-search-results]", page);

    fillSelect(type, uniqueOptions(movies, "type"));
    fillSelect(region, uniqueOptions(movies, "region"));
    fillSelect(year, uniqueOptions(movies, "year"));

    function match(movie) {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var tagText = (movie.tags || []).join(" ");
      var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, tagText, movie.oneLine].join(" "));
      return (!keyword || text.indexOf(keyword) !== -1)
        && (!typeValue || normalize(movie.type) === typeValue)
        && (!regionValue || normalize(movie.region) === regionValue)
        && (!yearValue || normalize(movie.year) === yearValue);
    }

    function render() {
      var keyword = normalize(input && input.value);
      var filtered = movies.filter(match);
      var selected = keyword ? filtered.slice(0, 240) : filtered.slice(0, 96);
      results.innerHTML = selected.map(movieCard).join("");
    }

    [input, type, region, year].forEach(function(el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }

  window.SitePlayer = {
    mount: function(src) {
      var video = one("#movieVideo");
      var overlay = one("#playOverlay");
      var prepared = false;
      var hls = null;

      if (!video || !overlay || !src) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        video.controls = true;
      }

      function start() {
        prepare();
        overlay.classList.add("hidden");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function() {
            overlay.classList.remove("hidden");
          });
        }
      }

      overlay.addEventListener("click", start);
      video.addEventListener("play", function() {
        overlay.classList.add("hidden");
      });
      video.addEventListener("pause", function() {
        if (!video.ended) {
          overlay.classList.remove("hidden");
        }
      });
      video.addEventListener("ended", function() {
        overlay.classList.remove("hidden");
      });
      video.addEventListener("click", function() {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener("beforeunload", function() {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    initNav();
    initHero();
    initCardFilters();
    initSearchPage();
  });
})();
