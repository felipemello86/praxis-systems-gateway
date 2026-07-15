import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Praxis",
  description: "Excelência operacional hoteleira.",
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
