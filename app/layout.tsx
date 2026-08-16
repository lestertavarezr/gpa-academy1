import type { Metadata } from "next";
import { Unbounded, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GPA Academy | Formación Médico-Quirúrgica de Excelencia",
  description:
    "GPA Academy — academia de educación médico-quirúrgica en Santo Domingo, República Dominicana. Diplomados y programas 100% online avalados por el Colegio Médico Dominicano (CMD).",
  keywords: [
    "GPA Academy",
    "asistencia quirúrgica",
    "sutura online",
    "neuroimágenes",
    "instrumentación laparoscópica",
    "educación médica República Dominicana",
  ],
  openGraph: {
    title: "GPA Academy | Formación Médico-Quirúrgica de Excelencia",
    description:
      "Programas 100% online avalados por el Colegio Médico Dominicano (CMD). Más de 300,000 profesionales de la salud nos siguen en toda Latinoamérica.",
    type: "website",
    locale: "es_DO",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-theme="dark"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-jarvis-navy font-sans antialiased">{children}</body>
    </html>
  );
}
