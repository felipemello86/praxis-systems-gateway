import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Praxis",
  description: "Excelência operacional hoteleira.",
};

// viewport-fit=cover: deixa o app Capacitor (WKWebView) desenhar por baixo
// do notch/Dynamic Island e da barra home do iPhone — sem isso, os
// env(safe-area-inset-*) usados em page.module.css sempre resolvem pra 0 e
// o logo pode renderizar sobreposto ao Dynamic Island (visto em gravação
// de tela do Felipe).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#f5f5f7",
          color: "#1d1d1f",
        }}
      >
        {children}
      </body>
    </html>
  );
}
