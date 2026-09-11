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
      */

  const clientsData = [
    {
      name: "Restaurante Flight 510",
      since: "Cliente desde 2011",
      desc: "Tradicional restaurante em São Paulo focado em refeições diárias com alto padrão de atendimento e grande fluxo diário."
    },
    {
      name: "Top Game",
      since: "Cliente desde 2025",
      desc: "Importadora e operadora de equipamentos de entretenimento que atua com muita força no varejo e negócios de diversão."
    },
    {
      name: "Pizzaria Sp Diversões",
      since: "Parceria contínua",
      desc: "Consolidado espaço gastronômico com destaque para preparos no forno a lenha e intenso fluxo de clientes."
    },
    {
      name: "Grupo GPS",
      since: "Cliente desde 2013",
      desc: "Referência na prestação de serviços de facilities, segurança e terceirização de mão de obra desde 1962."
    }
  ];

  (function initCarousel() {
    const track = document.getElementById("clientTrack");
    const wrap = document.getElementById("carouselWrap");

    if (!track || !wrap) return;

    let html = "";
    clientsData.forEach(function (c) {
      html +=
        '<div class="client-card">' +
        "<h3>" + c.name + "</h3>" +
        '<div class="since">' + c.since + "</div>" +
        "<p>" + c.desc + "</p>" +
        "</div>";
    });

    track.innerHTML = html + html + html + html;

    var totalCards = clientsData.length;
    var currentX = 0;
    var isDragging = false;
    var startX = 0;
    var dragStartX = 0;
    var autoScroll = true;
    var animId = null;

    function getCardWidth() {
      var first = track.querySelector(".client-card");
      if (!first) return 260;
      var minWidth = parseFloat(window.getComputedStyle(first).minWidth) || 240;
      return minWidth + 16;
    }

    function updateTransform(x) {
      track.style.transform = "translateX(" + -x + "px)";
    }

    function animate() {
      if (autoScroll) {
        currentX += 0.4;
        var cw = getCardWidth();
        var setWidth = cw * totalCards;
        if (currentX >= setWidth) {
          currentX -= setWidth;
        }
        updateTransform(currentX);
      }
      animId = requestAnimationFrame(animate);
    }

    wrap.addEventListener("mousedown", function (e) {
      isDragging = true;
      startX = e.pageX;
      dragStartX = currentX;
      autoScroll = false;
      wrap.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var diff = e.pageX - startX;
      currentX = dragStartX - diff;
      if (currentX < 0) currentX = 0;
      var cw = getCardWidth();
      var maxX = cw * totalCards * 2;
      if (currentX > maxX) currentX = maxX;
      updateTransform(currentX);
    });

    window.addEventListener("mouseup", function () {
      if (!isDragging) return;
      isDragging = false;
      wrap.style.cursor = "grab";
      autoScroll = true;
      var cw = getCardWidth();
      var setWidth = cw * totalCards;
      while (currentX >= setWidth) currentX -= setWidth;
      while (currentX < 0) currentX += setWidth;
      updateTransform(currentX);
    });

    wrap.addEventListener("touchstart", function (e) {
      isDragging = true;
      startX = e.touches[0].pageX;
      dragStartX = currentX;
      autoScroll = false;
    }, { passive: true });

    wrap.addEventListener("touchmove", function (e) {
      if (!isDragging) return;
      var diff = e.touches[0].pageX - startX;
      currentX = dragStartX - diff;
      if (currentX < 0) currentX = 0;
      var cw = getCardWidth();
      var maxX = cw * totalCards * 2;
      if (currentX > maxX) currentX = maxX;
      updateTransform(currentX);
    }, { passive: true });

    wrap.addEventListener("touchend", function () {
      if (!isDragging) return;
      isDragging = false;
      autoScroll = true;
      var cw = getCardWidth();
      var setWidth = cw * totalCards;
      while (currentX >= setWidth) currentX -= setWidth;
      while (currentX < 0) currentX += setWidth;
      updateTransform(currentX);
    }, { passive: true });

    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    /* Movimento reduzido: cartoes ficam estaticos e nenhum rAF fica girando. */
    if (menosMovimento()) {
      autoScroll = false;
      updateTransform(0);
    } else {
      animate();
    }
  })();

  /* 
     2. COOKIE BANNER
      */

  (function initCookieBanner() {
    var consent = localStorage.getItem("senic_cookie_consent");
    var banner = document.getElementById("cookieBanner");
    var acceptBtn = document.getElementById("cookieAccept");

    if (!banner || !acceptBtn) return;

    if (!consent) {
      setTimeout(function () {
        banner.classList.add("show");
      }, 800);
    }

    acceptBtn.addEventListener("click", function () {
      localStorage.setItem("senic_cookie_consent", "true");
      banner.classList.remove("show");
    });
  })();

  /* 
     3. HEADER — SCROLL EFFECT
      */

  (function initHeaderScroll() {
    var header = document.getElementById("header");
    if (!header) return;

    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
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

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener("resize", update, { passive: true });
    update();
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

    function render() {
      pendente = false;
      if (reduzido.matches) { foto.style.transform = ""; return; }

      var altura = window.innerHeight;
      var amplitude = window.innerWidth < 600 ? 24 : 56;
      var topo = hero.getBoundingClientRect().top;
      var progresso = Math.max(0, Math.min(1, -topo / altura));

      /* A escala mantém sobra de imagem para o deslocamento nunca expor a borda. */
      foto.style.transform =
        "translate3d(0," + (progresso * amplitude).toFixed(1) + "px,0) scale(" +
        (1.06 - progresso * 0.04).toFixed(3) + ")";
    }

    function agendar() {
      if (!pendente) { pendente = true; requestAnimationFrame(render); }
    }

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    reduzido.addEventListener("change", render);
    render();
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
    var ultimoY = window.scrollY;

    function render() {
      pendente = false;
      if (reduzido.matches) {
        aguia.style.transform = "";
        if (asaE) asaE.style.transform = "";
        if (asaD) asaD.style.transform = "";
        return;
      }

      var rect = secao.getBoundingClientRect();
      var altura = window.innerHeight;

      /* 0 quando a faixa surge por baixo da tela, 1 quando termina de sair
         por cima. Rolar para trás rebobina o voo pelo mesmo caminho. */
      var p = Math.max(0, Math.min(1, (altura - rect.top) / (altura + rect.height)));

      var largura = palco.clientWidth;
      var env = aguia.offsetWidth;
      var estreito = window.innerWidth < 600;

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
    window.addEventListener("resize", agendar, { passive: true });
    reduzido.addEventListener("change", render);
    render();
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