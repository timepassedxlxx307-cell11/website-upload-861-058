(function () {
    var menuButton = document.querySelector('.js-menu-toggle');
    var mobilePanel = document.querySelector('.js-mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('.js-hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var prev = hero.querySelector('.js-hero-prev');
        var next = hero.querySelector('.js-hero-next');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restartTimer();
            });
        });

        restartTimer();
    }

    function normalizeText(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function applyFilter(input, cards, activeCategory) {
        var keyword = normalizeText(input ? input.value : '');
        var category = activeCategory || 'all';

        cards.forEach(function (card) {
            var search = normalizeText(card.getAttribute('data-search'));
            var cardCategory = card.getAttribute('data-category') || '';
            var keywordMatched = !keyword || search.indexOf(keyword) !== -1;
            var categoryMatched = category === 'all' || category === cardCategory;
            card.classList.toggle('is-hidden-card', !(keywordMatched && categoryMatched));
        });
    }

    var localSearch = document.querySelector('.js-local-search');
    if (localSearch) {
        var localCards = Array.prototype.slice.call(document.querySelectorAll('.js-card-list .js-movie-card'));
        localSearch.addEventListener('input', function () {
            applyFilter(localSearch, localCards, 'all');
        });
    }

    var globalSearch = document.querySelector('.js-search-input');
    if (globalSearch) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card-list .js-movie-card'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.js-filter-chips button'));
        var activeCategory = 'all';

        globalSearch.addEventListener('input', function () {
            applyFilter(globalSearch, cards, activeCategory);
        });

        chips.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter') || 'all';
                chips.forEach(function (chip) {
                    chip.classList.toggle('is-active', chip === button);
                });
                applyFilter(globalSearch, cards, activeCategory);
            });
        });
    }
}());
