/*
   SENIC SERVIÇOS — BUILD
   Embute assets/css/style.css (minificado) no <head> do index.html, entre os
   marcadores CSS:INICIO e CSS:FIM. CSS inline elimina a única requisição que
   ainda bloqueava a primeira pintura.

   Também carimba ?v=<hash> em todo CSS/JS referenciado pelos HTML, para o
   cache de 1 ano (.htaccess) nunca servir uma versão antiga.

   Uso (sempre que editar CSS ou JS):  node tools/build.mjs
   Sem dependências — só Node 18+.
*/

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(raiz, "assets/css/style.css");
const htmlPath = join(raiz, "index.html");

function minificarCss(css) {
  /* strings (url, content, font-family) ficam guardadas e voltam intactas */
  const guardados = [];
  css = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => {
      guardados.push(m);
      return `@@STR${guardados.length - 1}@@`;
    });

  css = css
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

  return css.replace(/@@STR(\d+)@@/g, (_, i) => guardados[Number(i)]);
}

const css = minificarCss(readFileSync(cssPath, "utf8"));
const html = readFileSync(htmlPath, "utf8");

const re = /(<!-- CSS:INICIO[^>]*-->)[\s\S]*?(\s*<!-- CSS:FIM -->)/;
if (!re.test(html)) {
  console.error("Marcadores CSS:INICIO / CSS:FIM não encontrados no index.html");
  process.exit(1);
}

writeFileSync(htmlPath, html.replace(re, `$1\n  <style>${css}</style>$2`));
console.log(`CSS embutido: ${(css.length / 1024).toFixed(1)} KB`);

function versionar(arquivoHtml) {
  const caminho = join(raiz, arquivoHtml);
  const conteudo = readFileSync(caminho, "utf8").replace(
    /((?:src|href)="\/?)(assets\/(?:js|css)\/[\w.-]+\.(?:js|css))(?:\?v=\w+)?"/g,
    (_, prefixo, arquivo) => {
      const hash = createHash("sha1").update(readFileSync(join(raiz, arquivo))).digest("hex").slice(0, 10);
      return `${prefixo}${arquivo}?v=${hash}"`;
    }
  );
  writeFileSync(caminho, conteudo);
}

["index.html", "politica.html"].forEach(versionar);
console.log("Versões de CSS/JS atualizadas.");
