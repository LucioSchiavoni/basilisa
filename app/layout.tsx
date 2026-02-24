import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://test-basilisa.vercel.app"),
  title: "LISA 2.0 (Beta)",
  description: "LISA 2.0 - Lectura accesible basada en evidencia. Plataforma líder en evaluación y mejora de la comprensión lectora.",
  keywords: ["LISA", "Lectura", "Accesibilidad", "Evidencia", "Educación", "Comprensión Lectora"],
  authors: [{ name: "LISA Team" }],
  openGraph: {
    title: "LISA 2.0",
    description: "Lectura accesible basada en evidencia. Plataforma líder en evaluación y mejora de la comprensión lectora.",
    url: "https://test-basilisa.vercel.app", // Adjust this if you have a real domain
    siteName: "LISA 2.0",
    images: [
      {
        url: "/og-image.png", // Assuming we might have one or will create one
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LISA 2.0",
    description: "Lectura accesible basada en evidencia.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${lexend.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
