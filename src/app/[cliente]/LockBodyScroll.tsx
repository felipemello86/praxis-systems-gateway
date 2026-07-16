// DESATIVADO — o lock de scroll via JS (useEffect aplicando inline style em
// html/body no mount) foi substituído por CSS puro direto em
// page.module.css (regras :global(html), :global(body)). Motivo: JS só
// roda DEPOIS da hidratação, então entre o HTML chegar do servidor e o
// React hidratar, html/body ficavam sem nenhuma restrição de scroll — o
// WKWebView (app Capacitor) conseguia "travar" nesse estado rolável (scroll
// horizontal E vertical, ver relato do Felipe) mesmo depois do JS aplicar
// overflow:hidden. CSS aplica desde o primeiro frame, sem essa janela.
//
// Arquivo mantido como no-op (não deletado por limitação do ambiente) em
// vez de apagado — pode ser removido manualmente (`rm` local) se quiser
// limpar. Não é mais importado em nenhum lugar.
export function LockBodyScroll() {
  return null;
}
