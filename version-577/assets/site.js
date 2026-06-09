(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var queryName = input.getAttribute("data-url-query");
            if (queryName) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(queryName);
                if (value) {
                    input.value = value;
                }
            }
            var targetId = input.getAttribute("data-filter-target");
            var target = targetId ? document.getElementById(targetId) : input.closest("main");
            var cards = target ? Array.prototype.slice.call(target.querySelectorAll("[data-search]")) : [];
            function apply() {
                var term = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("is-hidden", term && haystack.indexOf(term) === -1);
                });
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initPlayer() {
        var video = document.getElementById("movie-player");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger]"));
        var status = document.querySelector("[data-player-status]");
        var shell = video ? video.closest(".player-shell") : null;
        if (!video || !buttons.length) {
            return;
        }
        var started = false;
        var hlsInstance = null;
        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }
        function playStream(stream) {
            if (!stream) {
                setStatus("暂时无法播放");
                return;
            }
            setStatus("加载中");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!started) {
                    video.src = stream;
                    started = true;
                }
                video.play().then(function () {
                    if (shell) {
                        shell.classList.add("playing");
                    }
                    setStatus("正在播放");
                }).catch(function () {
                    setStatus("点击播放键继续");
                });
                return;
            }
            loadHlsLibrary().then(function (Hls) {
                if (!Hls || !Hls.isSupported()) {
                    setStatus("播放失败，请稍后重试");
                    return;
                }
                if (!hlsInstance) {
                    hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    started = true;
                }
                video.play().then(function () {
                    if (shell) {
                        shell.classList.add("playing");
                    }
                    setStatus("正在播放");
                }).catch(function () {
                    setStatus("点击播放键继续");
                });
            }).catch(function () {
                setStatus("播放失败，请稍后重试");
            });
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                playStream(button.getAttribute("data-stream"));
            });
        });
        video.addEventListener("click", function () {
            if (!started && buttons[0]) {
                playStream(buttons[0].getAttribute("data-stream"));
            }
        });
    }
})();
