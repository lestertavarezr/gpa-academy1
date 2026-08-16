import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es" data-theme="dark">
      <body className="bg-jarvis-navy font-sans antialiased">{children}</body>
    </html>
  );
}
