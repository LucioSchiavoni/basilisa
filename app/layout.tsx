import type { Metadata } from "next";
import { Lexend, Caveat, Fredoka } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://test-basilisa.vercel.app"),
  title: "LISA 2.0 (Beta)",
  icons: {
    icon: "/logos/Logotipo Lisa color simple.png",
    apple: "/logos/Logotipo Lisa color simple.png",
  },
  description: "LISA 2.0 - Lectura accesible basada en evidencia. Plataforma para evaluación y mejora de la comprensión lectora.",
  keywords: ["LISA", "Lectura", "Accesibilidad", "Evidencia", "Educación", "Comprensión Lectora"],
  authors: [{ name: "LISA Team" }],
  openGraph: {
    title: "LISA 2.0",
    description: "Lectura accesible basada en evidencia. Plataforma para evaluación y mejora de la comprensión lectora.",
    url: "https://test-basilisa.vercel.app",
    siteName: "LISA 2.0",
    images: [
      {
        url: "/logos/Logotipo Lisa color simple.png",
        width: 1200,
        height: 630,
        alt: "LISA 2.0 Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LISA 2.0",
    description: "Lectura accesible basada en evidencia.",
    images: ["/logos/Logotipo Lisa color simple.png"],
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme'),s=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&s)){document.documentElement.classList.add('dark');document.documentElement.style.backgroundColor='#1F1F1F';}else{document.documentElement.style.backgroundColor='#ffffff';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${lexend.variable} ${caveat.variable} ${fredoka.variable} antialiased bg-background`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
