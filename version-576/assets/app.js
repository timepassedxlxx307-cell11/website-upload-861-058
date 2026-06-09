(function() {
  var root = document.body ? (document.body.getAttribute('data-site-root') || './') : './';

  function byClass(name, base) {
    return Array.prototype.slice.call((base || document).getElementsByClassName(name));
  }

  function joinRoot(path) {
    return root + path;
  }

  var menu = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menu && mobileNav) {
    menu.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = byClass('hero-slide');
  var dots = byClass('hero-dot');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    timer = setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function resetSlides() {
    if (timer) {
      clearInterval(timer);
    }
    startSlides();
  }

  var next = document.querySelector('.hero-next');
  var prev = document.querySelector('.hero-prev');
  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      resetSlides();
    });
  }
  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      resetSlides();
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
      resetSlides();
    });
  });
  startSlides();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(input, panel) {
    var query = normalize(input.value);
    if (!query) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }
    var source = typeof searchData !== 'undefined' ? searchData : [];
    var results = source.filter(function(item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 10);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">未找到匹配内容</div>';
      panel.classList.add('is-open');
      return;
    }
    panel.innerHTML = results.map(function(item) {
      return '<a class="search-result-item" href="' + joinRoot(item.url) + '">' +
        '<img src="' + joinRoot(item.image) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('is-open');
  }

  byClass('site-search-input').forEach(function(input) {
    var panel = input.parentElement ? input.parentElement.querySelector('.site-search-results') : null;
    if (!panel) {
      return;
    }
    input.addEventListener('input', function() {
      renderSearch(input, panel);
    });
    input.addEventListener('focus', function() {
      renderSearch(input, panel);
    });
    document.addEventListener('click', function(event) {
      if (!input.parentElement.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

  byClass('library-tools').forEach(function(tools) {
    var search = tools.querySelector('.library-search');
    var grid = tools.parentElement ? tools.parentElement.querySelector('.library-grid') : null;
    var buttons = Array.prototype.slice.call(tools.querySelectorAll('[data-filter]'));
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var active = 'all';

    function apply() {
      var q = normalize(search ? search.value : '');
      cards.forEach(function(card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchText = !q || text.indexOf(q) !== -1;
        var matchFilter = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden-card', !(matchText && matchFilter));
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        buttons.forEach(function(item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        active = button.getAttribute('data-filter') || 'all';
        apply();
      });
    });
  });
})();
