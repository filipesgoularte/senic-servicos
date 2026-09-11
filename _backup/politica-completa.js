/*
   SENIC SERVIÇOS — POLITICA.JS
   Comportamentos da página de política de privacidade e cookies.
   Todos os direitos reservados © 2026
*/

(function () {
  "use strict";

  var CHAVE_CONSENTIMENTO = "senic_cookie_consent";

  function menosMovimento() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Leitura e escrita de consentimento nunca podem derrubar a página:
     navegação anônima e cookies bloqueados fazem localStorage lançar erro. */
  function lerConsentimento() {
    try { return localStorage.getItem(CHAVE_CONSENTIMENTO); }
    catch (e) { return null; }
  }

  function apagarConsentimento() {
    try { localStorage.removeItem(CHAVE_CONSENTIMENTO); return true; }
    catch (e) { return false; }
  }

  /* 
     1. HEADER — SCROLL EFFECT
      */

  (function initHeaderScroll() {
    var header = document.getElementById("header");
    if (!header) return;

    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }, { passive: true });
  })();

  /* 
     2. BARRA DE PROGRESSO DE LEITURA
      */

  (function initScrollProgress() {
    var bar = document.getElementById("scrollProgress");
    if (!bar) return;

    var pendente = false;

    function update() {
      pendente = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
    }

    window.addEventListener("scroll", function () {
      if (!pendente) { pendente = true; requestAnimationFrame(update); }
    }, { passive: true });

    window.addEventListener("resize", update, { passive: true });
    update();
  })();

  /* 
     3. SUMÁRIO — ABERTO NO DESKTOP, RECOLHIDO NO CELULAR
     
     O <details> nasce fechado no HTML: se o JS falhar, o visitante ainda
     consegue abrir o índice no toque. Aqui só automatizamos o desktop,
     onde o sumário é uma coluna fixa e não faz sentido ficar escondido.
      */

  (function initSumarioResponsivo() {
    var nav = document.getElementById("sumario");
    if (!nav) return;

    var largo = window.matchMedia("(min-width: 1024px)");

    function ajustar() {
      if (largo.matches) nav.open = true;
    }

    ajustar();
    largo.addEventListener("change", ajustar);

    /* No celular, escolher um item fecha o índice e revela o texto. */
    nav.querySelectorAll(".legal-nav-list a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (!largo.matches) nav.open = false;
      });
    });
  })();

  /* 
     4. SUMÁRIO — MARCAÇÃO DA SEÇÃO EM LEITURA
      */

  (function initScrollSpy() {
    var links = document.querySelectorAll(".legal-nav-list a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    var porId = {};
    var secoes = [];

    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var alvo = document.getElementById(id);
      if (!alvo) return;
      porId[id] = a;
      secoes.push(alvo);
    });

    if (!secoes.length) return;

    var visiveis = [];

    function marcar(id) {
      links.forEach(function (a) { a.classList.remove("ativo"); });
      var atual = porId[id];
      if (!atual) return;
      atual.classList.add("ativo");

      /* Mantém o item ativo dentro da área visível da coluna fixa. */
      var lista = atual.parentElement;
      if (lista && lista.scrollHeight > lista.clientHeight) {
        var topo = atual.offsetTop - lista.clientHeight / 2 + atual.offsetHeight / 2;
        lista.scrollTo({ top: topo, behavior: menosMovimento() ? "auto" : "smooth" });
      }
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var id = entrada.target.id;
        var i = visiveis.indexOf(id);
        if (entrada.isIntersecting && i === -1) visiveis.push(id);
        if (!entrada.isIntersecting && i !== -1) visiveis.splice(i, 1);
      });

      if (!visiveis.length) return;

      /* Com várias seções na tela, vale a que está mais acima no documento. */
      var primeira = secoes.filter(function (s) {
        return visiveis.indexOf(s.id) !== -1;
      })[0];

      if (primeira) marcar(primeira.id);
    }, { rootMargin: "-96px 0px -62% 0px", threshold: 0 });

    secoes.forEach(function (s) { observador.observe(s); });
  })();

  /* 
     5. NAVEGAÇÃO INTERNA SUAVE
      */

  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#") return;
        var alvo = document.querySelector(href);
        if (!alvo) return;
        e.preventDefault();
        alvo.scrollIntoView({
          behavior: menosMovimento() ? "auto" : "smooth",
          block: "start"
        });
        /* O endereço passa a refletir a seção lida — o link fica compartilhável. */
        if (history.replaceState) history.replaceState(null, "", href);
      });
    });
  })();

  /* 
     6. VOLTAR AO TOPO
      */

  (function initVoltarAoTopo() {
    var btn = document.getElementById("toTop");
    if (!btn) return;

    var pendente = false;

    function update() {
      pendente = false;
      btn.classList.toggle("visivel", window.scrollY > 700);
    }

    window.addEventListener("scroll", function () {
      if (!pendente) { pendente = true; requestAnimationFrame(update); }
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: menosMovimento() ? "auto" : "smooth" });
    });

    update();
  })();

  /* 
     7. PAINEL DE CONSENTIMENTO DE COOKIES
     
     A LGPD exige que revogar o consentimento seja tão simples quanto concedê-lo.
     Este painel mostra o estado atual e apaga a marca de aceite, fazendo o
     aviso de cookies voltar a aparecer na próxima visita ao site.
      */

  (function initPainelConsentimento() {
    var status = document.getElementById("consentStatus");
    var texto = document.getElementById("consentTexto");
    var revogar = document.getElementById("consentRevogar");
    if (!status || !texto) return;

    function render() {
      var aceito = lerConsentimento() === "true";
      status.classList.toggle("aceito", aceito);
      texto.innerHTML = aceito
        ? "Situação atual: <strong>aviso de cookies aceito</strong> neste navegador."
        : "Situação atual: <strong>nenhum aceite registrado</strong> neste navegador.";
      if (revogar) revogar.disabled = !aceito;
      if (revogar) revogar.style.opacity = aceito ? "" : ".45";
    }

    if (revogar) {
      revogar.addEventListener("click", function () {
        var ok = apagarConsentimento();
        render();
        texto.innerHTML = ok
          ? "Consentimento revogado. O aviso de cookies voltará a aparecer na próxima visita — os cookies já gravados devem ser apagados pelo próprio navegador, como explicamos no item 10.4."
          : "Não foi possível alterar o registro: este navegador está bloqueando o armazenamento local. Use as configurações do navegador para limpar os dados do site.";
      });
    }

    render();
  })();

  /* 
     8. DATA DE ATUALIZAÇÃO — ano do rodapé sempre correto
      */

  (function initAnoRodape() {
    var alvo = document.getElementById("anoAtual");
    if (alvo) alvo.textContent = new Date().getFullYear();
  })();

})();
