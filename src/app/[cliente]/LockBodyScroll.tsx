"use client";

import { useEffect } from "react";

// Trava o scroll do documento nesta tela (login + hub de módulos). Sem
// isso, ao focar o campo de email/senha dentro do app Capacitor (WKWebView
// no iOS), o teclado abre e o WebView rola a página inteira pra revelar o
// campo focado — só que aqui a página inteira JÁ CABE na tela (100dvh,
// overflow hidden no <main>), então esse scroll nativo só empurra tudo pra
// cima e esconde o cabeçalho (logo + nome do hotel) atrás do teclado, sem
// nenhum ganho (nada "aparece" que já não estivesse visível).
//
// `position: fixed` no <body> tira o documento do elemento que o WKWebView
// rola nativamente (ele rola o scroll container do documento, não o layout
// interno) — truque padrão pra esse tipo de app "sem rolagem".
//
// Só afeta esta tela: toda navegação daqui pra frente (Configurações,
// módulos) é reload completo (<a> pura, não <Link> — ver comentário em
// page.tsx), então o próximo documento carrega sem esse estilo aplicado.
export function LockBodyScroll() {
  useEffect(() => {
    const { body, documentElement: html } = document;

    // Trava os DOIS: só o body não bastou (ver gravação de tela — ainda
    // aparecia um indicador de scroll do lado direito mesmo parado, sem
    // teclado aberto). O elemento que efetivamente rola por padrão num
    // documento HTML normal é o <html>, não o <body> — travar só o body
    // deixa o <html> livre pra continuar sendo o scroller real.
    const target = [body, html];
    const prev = target.map((el) => ({
      position: el.style.position,
      width: el.style.width,
      height: el.style.height,
      overflow: el.style.overflow,
      overscrollBehavior: el.style.overscrollBehavior,
    }));

    for (const el of target) {
      el.style.position = "fixed";
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.overflow = "hidden";
      el.style.overscrollBehavior = "none";
    }

    return () => {
      target.forEach((el, i) => {
        el.style.position = prev[i].position;
        el.style.width = prev[i].width;
        el.style.height = prev[i].height;
        el.style.overflow = prev[i].overflow;
        el.style.overscrollBehavior = prev[i].overscrollBehavior;
      });
    };
  }, []);

  return null;
}
