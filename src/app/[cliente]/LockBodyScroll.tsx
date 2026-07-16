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
// IMPORTANTE — histórico de tentativas que quebraram coisa (não repetir):
// 1) `position: fixed` no <html> e no <body> junto: quebrou o toque no
//    botão "Sair" do rodapé (dupla posição fixa bagunça o hit-test de
//    toque do WKWebView perto da borda inferior).
// 2) Aplicar esse MESMO travamento (sem position:fixed) via CSS puro
//    carregado desde o primeiro paint (hub-lock.css, antes da hidratação):
//    quebrou geral — rodapé sumiu, botões pararam de funcionar, sobrou uma
//    faixa branca embaixo. Aparentemente o WKWebView do Capacitor calcula
//    o tamanho/posição do conteúdo usando o estado inicial do DOM antes do
//    JS rodar, e overflow:hidden em html/body JÁ no HTML estático (antes
//    da hidratação) confunde esse cálculo.
// `overflow: hidden` aplicado via JS (useEffect, DEPOIS da hidratação) é a
// única versão que não quebrou nada até agora — mantém esse comportamento
// mesmo sabendo que sobra um resíduo pequeno de scroll ao focar o campo de
// senha (aceitável comparado a travar o app inteiro).
//
// Só afeta esta tela: toda navegação daqui pra frente (Configurações,
// módulos) é reload completo (<a> pura, não <Link> — ver comentário em
// page.tsx), então o próximo documento carrega sem esse estilo aplicado.
export function LockBodyScroll() {
  useEffect(() => {
    const { body, documentElement: html } = document;
    const target = [body, html];

    const prev = target.map((el) => ({
      height: el.style.height,
      overflow: el.style.overflow,
      overscrollBehavior: el.style.overscrollBehavior,
    }));

    for (const el of target) {
      el.style.height = "100%";
      el.style.overflow = "hidden";
      el.style.overscrollBehavior = "none";
    }

    return () => {
      target.forEach((el, i) => {
        el.style.height = prev[i].height;
        el.style.overflow = prev[i].overflow;
        el.style.overscrollBehavior = prev[i].overscrollBehavior;
      });
    };
  }, []);

  return null;
}
