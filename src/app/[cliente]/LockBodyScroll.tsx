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
    const { body } = document;
    const prev = {
      position: body.style.position,
      width: body.style.width,
      height: body.style.height,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.width = prev.width;
      body.style.height = prev.height;
      body.style.overflow = prev.overflow;
    };
  }, []);

  return null;
}
