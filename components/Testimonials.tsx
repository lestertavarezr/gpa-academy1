"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Section, SectionHeading } from "./Section";

// NOTA: contenido de muestra — sustituir por testimonios reales de
// egresados (nombre, foto y programa cursado) antes de publicar.
const TESTIMONIALS = [
  {
    name: "Dra. Carolina Reyes",
    role: "Médico General · Santo Domingo, RD",
    program: "Diplomado en Asistencia Quirúrgica",
    quote:
      "GPA Academy me dio la confianza que me faltaba en quirófano. El contenido es directo, práctico y el aval del CMD le da un peso enorme a mi currículum.",
    initials: "CR",
  },
  {
    name: "Enf. Julio Martínez",
    role: "Enfermero Quirúrgico · Bogotá, Colombia",
    program: "Taller de Sutura Online",
    quote:
      "Pude repasar cada técnica las veces que necesité. La calidad de los videos y la claridad de los docentes marcaron la diferencia en mi práctica diaria.",
    initials: "JM",
  },
  {
    name: "Dra. Fernanda Osorio",
    role: "Residente de Radiología · Ciudad de México, México",
    program: "Programa de Neuroimágenes",
    quote:
      "El método de lectura sistemática que enseñan me cambió la forma de interpretar TAC y RM. Lo aplico desde la primera semana del programa.",
    initials: "FO",
  },
];

export function Testimonials() {
  return (
    <Section id="testimonios" className="bg-jarvis-navy">
      <SectionHeading
        eyebrow="Testimonios"
        title="Profesionales que ya dieron el siguiente paso"
        description="Miles de médicos, enfermeros y estudiantes de la salud en Latinoamérica ya se formaron con GPA Academy."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="glass-card flex flex-col p-7"
          >
            <Quote className="text-jarvis-cyan/40" size={28} />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
              “{t.quote}”
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jarvis-cyan/15 text-sm font-bold text-jarvis-cyanSoft ring-1 ring-jarvis-cyan/25">
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/45">{t.role}</p>
                <p className="text-xs text-jarvis-cyanSoft/80">{t.program}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
