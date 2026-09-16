/*
   SENIC SERVIÇOS — GTM.JS
   Carregamento adiado do Google Tag Manager (GTM-NGXDHTND).

   O gtm.js pesa ~450 KB e era o maior responsável pelo tempo de bloqueio da
   página. Ele agora só entra depois que a página já foi pintada: na primeira
   interação (rolar, tocar, teclar) ou 3,5 s após o carregamento — o que vier
   primeiro. O container só tem tags do Google Ads, que não precisam existir
   antes disso.

   Conversões não se perdem: se alguém clicar em WhatsApp/telefone antes de o
   GTM estar pronto, o clique é segurado por no máximo 900 ms, o GTM termina de
   carregar e o clique é repetido — aí o acionador de clique do Ads o registra.
   Todos os direitos reservados © 2026
*/

(function () {
  "use strict";

  var ID = "GTM-NGXDHTND";
  var ESPERA_MAX = 900;
  var carregado = false;
  var pronto = false;
  var aoFicarPronto = [];

  window.dataLayer = window.dataLayer || [];

  function marcarPronto() {
    if (pronto) return;
    pronto = true;
    aoFicarPronto.splice(0).forEach(function (fn) { fn(); });
  }

  function carregar() {
    if (carregado) return;
    carregado = true;
    EVENTOS.forEach(function (ev) { window.removeEventListener(ev, carregar, OPC); });

    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + ID;
    /* o onload dispara depois que o container executou e registrou os ouvintes de clique */
    s.onload = s.onerror = function () { setTimeout(marcarPronto, 60); };
    document.head.appendChild(s);
  }

  var EVENTOS = ["scroll", "pointerdown", "keydown", "touchstart", "mousemove"];
  var OPC = { passive: true, once: true };
  EVENTOS.forEach(function (ev) { window.addEventListener(ev, carregar, OPC); });

  window.addEventListener("load", function () {
    setTimeout(carregar, 3500);
  });

  /* Segura cliques de conversão feitos antes de o GTM terminar de carregar. */
  document.addEventListener("click", function (e) {
    if (pronto || e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]');
    if (!link || link.dataset.gtmRepetido) return;

    e.preventDefault();
    carregar();

    var feito = false;
    function repetir() {
      if (feito) return;
      feito = true;
      link.dataset.gtmRepetido = "1";
      link.click();
      delete link.dataset.gtmRepetido;
    }
    aoFicarPronto.push(repetir);
    setTimeout(repetir, ESPERA_MAX);
  }, true);
})();
