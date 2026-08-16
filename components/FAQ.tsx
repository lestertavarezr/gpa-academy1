"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Section, SectionHeading } from "./Section";

const GENERAL_FAQ = [
  {
    question: "¿Cómo accedo al contenido después de inscribirme?",
    answer:
      "Recibirás tus credenciales de acceso a GPA Academy OS por correo electrónico y WhatsApp una vez confirmado tu pago, donde encontrarás video clases, presentaciones, podcasts y evaluaciones.",
  },
  {
    question: "¿Los programas ofrecen certificado?",
    answer:
      "Sí. Cada programa incluye certificado digital al completar sus evaluaciones. El Diplomado en Asistencia Quirúrgica está además avalado por el Colegio Médico Dominicano (CMD).",
  },
  {
    question: "¿En qué países puedo tomar los programas?",
    answer:
      "Todos nuestros programas son 100% online y accesibles desde cualquier país de Latinoamérica y el mundo, dentro de GPA Academy OS.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Procesamos los pagos de forma segura a través de Pagadito, con opciones de tarjeta de crédito, débito y otros métodos disponibles según tu país.",
  },
  {
    question: "¿Tienen soporte si tengo dudas durante el programa?",
    answer:
      "Sí, nuestro equipo está disponible por WhatsApp para resolver dudas académicas y administrativas durante todo el programa.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-[15px] font-medium text-white">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-jarvis-cyanSoft"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-jarvis-navyLight/20">
      <SectionHeading
        eyebrow="Preguntas frecuentes"
        title="Resolvemos tus dudas"
        description="¿Tienes otra pregunta? Escríbenos por WhatsApp y te respondemos al instante."
      />

      <div className="mx-auto max-w-3xl space-y-4">
        {GENERAL_FAQ.map((item, i) => (
          <FAQItem
            key={item.question}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </Section>
  );
}
