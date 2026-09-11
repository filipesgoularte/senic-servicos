/*
   SENIC SERVIÇOS — POLITICA.JS
   Comportamentos da página de política de privacidade e cookies.
   Todos os direitos reservados © 2026
*/

(function () {
  "use strict";

  var CHAVE_CONSENTIMENTO = "senic_cookie_consent";

  /* Ler e escrever consentimento nunca pode derrubar a página: navegação
     anônima e cookies bloqueados fazem o localStorage lançar erro. */
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
     2. REVOGAÇÃO DO CONSENTIMENTO DE COOKIES
     
     A LGPD exige que revogar seja tão simples quanto consentir. O botão
     apaga a marca de aceite: o aviso de cookies volta na próxima visita.
      */

  (function initConsentimento() {
    var texto = document.getElementById("consentTexto");
    var botao = document.getElementById("consentRevogar");
    if (!texto || !botao) return;

    function render() {
      var aceito = lerConsentimento() === "true";
      texto.innerHTML = aceito
        ? "Neste navegador, o aviso de cookies está <strong>aceito</strong>."
        : "Neste navegador, <strong>não há aceite registrado</strong>.";
      botao.disabled = !aceito;
      botao.style.opacity = aceito ? "" : ".45";
    }

    botao.addEventListener("click", function () {
      var ok = apagarConsentimento();
      render();
      texto.innerHTML = ok
        ? "Pronto: aceite revogado. O aviso volta a aparecer na próxima visita."
        : "Este navegador está bloqueando o armazenamento local. Use as configurações do navegador para limpar os dados do site.";
    });

    render();
  })();

  /* 
     3. VOLTAR AO SITE — FECHA A ABA
     
     Esta página abre em uma aba nova a partir da landing page, então voltar
     deve fechar a aba e revelar o site que já estava aberto atrás, em vez de
     abrir uma segunda cópia dele.

     O navegador só permite window.close() quando a aba é "script-closable":
     foi aberta por script ou ainda não navegou para lugar nenhum (histórico
     com uma única entrada). Quem chega direto do Google não se encaixa nisso
     — e para essa pessoa fechar a aba seria hostil, porque não há site nenhum
     por trás. Nesses casos o link navega normalmente.
      */

  (function initVoltarAoSite() {
    var links = document.querySelectorAll("a[data-voltar]");
    if (!links.length) return;

    function veioDoNossoSite() {
      /* rel="noopener" na landing page zera window.opener, então o referrer é
         o sinal confiável: veio de uma página nossa e esta aba é a primeira
         entrada do histórico. Testamos opener também caso o rel mude. */
      if (window.opener) return true;
      try {
        return window.history.length <= 1 &&
          !!document.referrer &&
          new URL(document.referrer).origin === window.location.origin;
      } catch (e) {
        return false;
      }
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (!veioDoNossoSite()) return;   /* deixa o link navegar normalmente */

        e.preventDefault();
        window.close();

        /* Se o navegador recusar o fechamento, o destino original ainda vale:
           a pessoa nunca fica presa nesta página. */
        setTimeout(function () {
          window.location.href = link.href;
        }, 200);
      });
    });
  })();

  /* 
     4. ANO DO RODAPÉ
      */

  (function initAnoRodape() {
    var alvo = document.getElementById("anoAtual");
    if (alvo) alvo.textContent = new Date().getFullYear();
  })();

})();
