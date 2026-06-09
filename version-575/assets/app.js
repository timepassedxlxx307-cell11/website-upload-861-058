(function () {
    function selectAll(scope, selector) {
        return Array.prototype.slice.call(scope.querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(hero, "[data-hero-slide]");
        var dots = selectAll(hero, "[data-hero-dot]");
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = selectAll(document, "[data-filter-panel]");
        panels.forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = targetSelector ? document.querySelector(targetSelector) : document;
            if (!target) {
                return;
            }
            var cards = selectAll(target, "[data-card]");
            if (!cards.length) {
                return;
            }
            var fields = {
                keyword: panel.querySelector("[data-filter-field='keyword']"),
                region: panel.querySelector("[data-filter-field='region']"),
                type: panel.querySelector("[data-filter-field='type']"),
                year: panel.querySelector("[data-filter-field='year']")
            };
            var empty = document.querySelector("[data-empty-state]");

            function apply() {
                var keyword = normalize(fields.keyword && fields.keyword.value);
                var region = normalize(fields.region && fields.region.value);
                var type = normalize(fields.type && fields.type.value);
                var year = normalize(fields.year && fields.year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.textContent
                    ].join(" "));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
                    var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
                    var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var isVisible = matchKeyword && matchRegion && matchType && matchYear;
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            Object.keys(fields).forEach(function (key) {
                if (fields[key]) {
                    fields[key].addEventListener("input", apply);
                    fields[key].addEventListener("change", apply);
                }
            });

            if (fields.keyword) {
                var params = new URLSearchParams(window.location.search);
                var query = params.get("q");
                if (query && !fields.keyword.value) {
                    fields.keyword.value = query;
                }
            }
            apply();
        });
    }

    window.SitePlayer = {
        mount: function (id, streamUrl) {
            var shell = document.getElementById(id);
            if (!shell) {
                return;
            }
            var video = shell.querySelector("video");
            var layer = shell.querySelector(".play-layer");
            var hlsInstance = null;
            var loaded = false;

            function attach() {
                if (!video || loaded) {
                    return;
                }
                loaded = true;
                video.controls = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attach();
                if (layer) {
                    layer.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (layer) {
                layer.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
