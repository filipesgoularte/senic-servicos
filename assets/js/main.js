/* 
   SENIC SERVIÇOS - MAIN.JS
   Landing page de alta conversão para Google Ads
   Todos os direitos reservados © 2026
    */

(function () {
  "use strict";

  /* Marca que o JS assumiu o controle. O CSS só esconde os elementos de
     revelação quando esta classe existe — se o script falhar, nada some. */
  document.documentElement.classList.add("js-pronto");

  function menosMovimento() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* 
     1. CLIENTES — CARROSSEL INFINITO COM DRAG
     Os cartões vêm prontos no HTML (indexáveis e sem innerHTML); o JS só
     duplica o conjunto para o loop e marca as cópias como decorativas.
      */

  (function initCarousel() {
    var track = document.getElementById("clientTrack");
    var wrap = document.getElementById("carouselWrap");

    if (!track || !wrap) return;

    var originais = Array.prototype.slice.call(track.children);
    var totalCards = originais.length;
    if (!totalCards) return;

    var copias = document.createDocumentFragment();
    for (var n = 0; n < 3; n++) {
      originais.forEach(function (card) {
        var c = card.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        copias.appendChild(c);
      });
    }
    track.appendChild(copias);

    var currentX = 0;
    var isDragging = false;
    var startX = 0;
    var dragStartX = 0;
    var autoScroll = true;
    var visivel = false;
    var animId = null;
    var cardWidth = 0;

    /* medida lida uma vez (e a cada resize) — nunca dentro do quadro de animação */
    function medir() {
      var first = track.firstElementChild;
      cardWidth = first ? first.getBoundingClientRect().width + 16 : 296;
    }

    function updateTransform(x) {
      track.style.transform = "translate3d(" + -x + "px,0,0)";
    }

    function normalizar() {
      var setWidth = cardWidth * totalCards;
      while (currentX >= setWidth) currentX -= setWidth;
      while (currentX < 0) currentX += setWidth;
    }

    function animate() {
      animId = null;
      if (!visivel) return;
      if (autoScroll) {
        currentX += 0.4;
        normalizar();
        updateTransform(currentX);
      }
      animId = requestAnimationFrame(animate);
    }

    function iniciar() {
      if (animId === null && visivel && !menosMovimento()) {
        animId = requestAnimationFrame(animate);
      }
    }

    function arrastar(pageX) {
      currentX = dragStartX - (pageX - startX);
      var maxX = cardWidth * totalCards * 2;
      currentX = Math.max(0, Math.min(maxX, currentX));
      updateTransform(currentX);
    }

    function comecar(pageX) {
      isDragging = true;
      startX = pageX;
      dragStartX = currentX;
      autoScroll = false;
    }

    function soltar() {
      if (!isDragging) return;
      isDragging = false;
      autoScroll = true;
      normalizar();
      updateTransform(currentX);
    }

    wrap.addEventListener("mousedown", function (e) {
      comecar(e.pageX);
      wrap.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", function (e) {
      if (isDragging) arrastar(e.pageX);
    });

    window.addEventListener("mouseup", function () {
      if (!isDragging) return;
      wrap.style.cursor = "grab";
      soltar();
    });

    wrap.addEventListener("touchstart", function (e) {
      comecar(e.touches[0].pageX);
    }, { passive: true });

    wrap.addEventListener("touchmove", function (e) {
      if (isDragging) arrastar(e.touches[0].pageX);
    }, { passive: true });

    wrap.addEventListener("touchend", soltar, { passive: true });

    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    window.addEventListener("resize", medir, { passive: true });

    /* Movimento reduzido: cartoes ficam estaticos e nenhum rAF fica girando.
       Fora da tela ou com a aba oculta, a animação também para. */
    if (menosMovimento()) return;

    new IntersectionObserver(function (entradas) {
      visivel = entradas[0].isIntersecting && !document.hidden;
      if (visivel) {
        if (!cardWidth) medir();
        iniciar();
      }
    }, { rootMargin: "100px 0px" }).observe(wrap);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) visivel = false;
    });
  })();

  /* 
     2. COOKIE BANNER
      */

  (function initCookieBanner() {
    var consent = null;
    try { consent = localStorage.getItem("senic_cookie_consent"); } catch (e) {}
    var banner = document.getElementById("cookieBanner");
    var acceptBtn = document.getElementById("cookieAccept");

    if (!banner || !acceptBtn) return;

    if (!consent) {
      setTimeout(function () {
        banner.classList.add("show");
      }, 800);
    }

    acceptBtn.addEventListener("click", function () {
      try { localStorage.setItem("senic_cookie_consent", "true"); } catch (e) {}
      banner.classList.remove("show");
    });
  })();

  /* 
     3. HEADER — SCROLL EFFECT
      */

  (function initHeaderScroll() {
    var header = document.getElementById("header");
    if (!header) return;

    var rolado = false;
    window.addEventListener("scroll", function () {
      var agora = window.scrollY > 50;
      if (agora !== rolado) {
        rolado = agora;
        header.classList.toggle("scrolled", agora);
      }
    }, { passive: true });
  })();

  /* 
     3b. BARRA DE PROGRESSO DE LEITURA
      */

  (function initScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;

    var ticking = false;
    var max = 0;

    function medir() {
      max = document.documentElement.scrollHeight - window.innerHeight;
    }

    function update() {
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)).toFixed(4) + ")";
      ticking = false;
    }

    function agendar() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", function () { medir(); agendar(); }, { passive: true });
    /* a altura só é lida depois do carregamento, fora da execução do script */
    window.addEventListener("load", function () { medir(); agendar(); });
  })();

  /* 
     4. FAQ — ACCORDION
      */

  (function initFAQ() {
    var items = document.querySelectorAll(".faq-question");
    if (!items.length) return;

    items.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = this.closest(".faq-item");
        var isActive = item.classList.contains("active");

        document.querySelectorAll(".faq-item").forEach(function (f) {
          f.classList.remove("active");
          f.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });

        if (!isActive) {
          item.classList.add("active");
          this.setAttribute("aria-expanded", "true");
        }
      });
    });
  })();

  /* 
     5. REVELAÇÃO NA ROLAGEM — entrada escalonada por seção
      */

  (function initScrollReveal() {
    if (!("IntersectionObserver" in window) || menosMovimento()) return;

    /* Cada grupo entra com o mesmo gesto; o índice dentro do grupo gera o
       atraso, então os cards aparecem em cascata em vez de todos de uma vez. */
    var GRUPOS = [
      { sel: ".section-head",     escalonar: false },
      { sel: ".trust-item",       escalonar: true  },
      { sel: ".qualifying-card",  escalonar: true  },
      { sel: ".service-card",     escalonar: true  },
      { sel: ".process-step",     escalonar: true  },
      { sel: ".comparison-col",   escalonar: true  },
      { sel: ".about-feature",    escalonar: true  },
      { sel: ".faq-item",         escalonar: true  },
      { sel: ".cta-content",      escalonar: false },
      { sel: ".about-image",      escalonar: false, direcao: "reveal-left"  },
      { sel: ".about-text",       escalonar: false, direcao: "reveal-right" }
    ];

    var alvos = [];

    GRUPOS.forEach(function (grupo) {
      var itens = document.querySelectorAll(grupo.sel);
      itens.forEach(function (el, i) {
        el.classList.add("reveal");
        if (grupo.direcao) el.classList.add(grupo.direcao);
        if (grupo.escalonar) el.style.setProperty("--delay", (i % 3) * 90 + "ms");
        alvos.push(el);
      });
    });

    var observador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("revealed");
          obs.unobserve(entrada.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });

    alvos.forEach(function (el) { observador.observe(el); });

    /* Navegação por teclado nunca espera uma animação para mostrar o foco. */
    document.addEventListener("focusin", function (e) {
      var alvo = e.target.closest && e.target.closest(".reveal");
      if (alvo) alvo.classList.add("revealed");
    });
  })();

  /* 
     5b. PARALAXE DO HERO — a foto acompanha a rolagem mais devagar
      */

  (function initHeroParallax() {
    var foto = document.querySelector(".hero-bg img");
    var hero = document.querySelector(".hero");
    if (!foto || !hero) return;

    var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    var pendente = false;
    var altura = window.innerHeight;
    var amplitude = window.innerWidth < 600 ? 24 : 56;

    function render() {
      pendente = false;
      if (reduzido.matches) { foto.style.transform = ""; return; }

      /* o hero começa no topo do documento: a rolagem já dá a posição sem ler layout */
      var y = window.scrollY;
      if (y > altura * 1.2) return;
      var progresso = Math.max(0, Math.min(1, y / altura));

      /* A escala mantém sobra de imagem para o deslocamento nunca expor a borda. */
      foto.style.transform =
        "translate3d(0," + (progresso * amplitude).toFixed(1) + "px,0) scale(" +
        (1.06 - progresso * 0.04).toFixed(3) + ")";
    }

    function agendar() {
      if (!pendente) { pendente = true; requestAnimationFrame(render); }
    }

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", function () {
      altura = window.innerHeight;
      amplitude = window.innerWidth < 600 ? 24 : 56;
      agendar();
    }, { passive: true });
    reduzido.addEventListener("change", render);
  })();

  /* 
     5c. VOO DA ÁGUIA — a marca cruza a faixa conforme a rolagem
      */

  (function initEagleFlight() {
    var secao = document.querySelector(".flight");
    if (!secao) return;

    var aguia  = secao.querySelector(".flight-eagle");
    var palco  = secao.querySelector(".flight-stage");
    var trilha = secao.querySelector(".flight-track i");
    var asaE   = secao.querySelector(".eagle-wing--l");
    var asaD   = secao.querySelector(".eagle-wing--r");
    if (!aguia || !palco) return;

    function suave(n) { return n * n * (3 - 2 * n); }

    var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    var pendente = false;
    var visivel = false;
    var ultimoY = window.scrollY;
    var altura, largura, env, estreito;

    /* medidas lidas só quando a faixa entra na tela ou a janela muda */
    function medir() {
      altura = window.innerHeight;
      largura = palco.clientWidth;
      env = aguia.offsetWidth;
      estreito = window.innerWidth < 600;
    }

    function render() {
      pendente = false;
      if (reduzido.matches) {
        aguia.style.transform = "";
        if (asaE) asaE.style.transform = "";
        if (asaD) asaD.style.transform = "";
        return;
      }
      if (!visivel) return;

      var rect = secao.getBoundingClientRect();

      /* 0 quando a faixa surge por baixo da tela, 1 quando termina de sair
         por cima. Rolar para trás rebobina o voo pelo mesmo caminho. */
      var p = Math.max(0, Math.min(1, (altura - rect.top) / (altura + rect.height)));

      /* As asas começam recolhidas e terminam de abrir no primeiro terço
         da faixa; a partir daí passam a bater. */
      var abertura = suave(Math.min(1, p / 0.32));
      var bat = Math.sin(p * Math.PI * 6);          // 3 batidas na travessia
      var ang = (1 - abertura) * 24 + bat * 13 * abertura;

      var x = -env * 0.55 + p * (largura + env * 1.1);
      /* a descida das asas empurra o corpo para cima — é o que dá peso ao voo */
      var y = Math.sin(p * Math.PI * 2) * (estreito ? 9 : 20)
            - bat * abertura * (estreito ? 4 : 7);

      aguia.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (asaE) asaE.style.transform = "rotate(" + ang.toFixed(2) + "deg)";
      if (asaD) asaD.style.transform = "rotate(" + (-ang).toFixed(2) + "deg)";
      if (trilha) trilha.style.transform = "scaleX(" + p.toFixed(3) + ")";
    }

    function agendar() {
      if (!visivel) return;
      var y = window.scrollY;
      /* limiar evita que micro-oscilações fiquem trocando a inclinação */
      if (Math.abs(y - ultimoY) > 2) {
        var descendo = y > ultimoY;
        secao.classList.toggle("descendo", descendo);
        secao.classList.toggle("subindo", !descendo);
        ultimoY = y;
      }
      if (!pendente) { pendente = true; requestAnimationFrame(render); }
    }

    secao.classList.add("descendo");
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", function () {
      if (visivel) { medir(); agendar(); }
    }, { passive: true });
    reduzido.addEventListener("change", render);

    new IntersectionObserver(function (entradas) {
      visivel = entradas[0].isIntersecting;
      if (visivel) {
        medir();
        ultimoY = window.scrollY;
        agendar();
      }
    }).observe(secao);
  })();

  /* 
     6. SMOOTH SCROLL — NAVEGAÇÃO INTERNA
      */

  (function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  })();

  /* 
     7. CONTADOR ANIMADO — ESTATÍSTICAS DO HERO
      */

  (function initAnimatedCounter() {
    var statsEl = document.getElementById("heroStats");
    if (!statsEl) return;

    function animateCounters() {
      var counters = statsEl.querySelectorAll(".hero-stat-num");
      var duration = 2000;
      var startTime = null;

      /* Movimento reduzido: mostra o numero final sem contagem. */
      if (menosMovimento()) {
        counters.forEach(function (el) {
          el.textContent = el.getAttribute("data-target") +
            (el.getAttribute("data-suffix") || "");
        });
        return;
      }

      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        el.currentTarget = target;
        el.currentSuffix = suffix;
        el.textContent = "0" + suffix;
      });

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);

        counters.forEach(function (el) {
          var target = el.currentTarget;
          var suffix = el.currentSuffix;
          var current = Math.round(eased * target);
          el.textContent = current + suffix;
        });

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsObserver.observe(statsEl);
  })();

})();