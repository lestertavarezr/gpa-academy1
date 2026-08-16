"use client";

import { motion } from "framer-motion";
import { AlarmClock, ArrowRight, Users } from "lucide-react";
import { programs } from "@/data/programs";

export function UrgencyBanner() {
  const diplomado = programs.find(
    (p) => p.slug === "asistencia-quirurgica"
  )!;

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-jarvis-gold/10 via-jarvis-navy to-jarvis-cyan/10" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="bracket-frame glass-card relative mx-auto flex max-w-5xl flex-col items-center gap-6 border-jarvis-gold/20 p-8 text-center md:flex-row md:justify-between md:text-left"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-jarvis-gold/25 bg-jarvis-gold/10 text-jarvis-goldSoft">
            <AlarmClock size={24} className="animate-pulse-slow" strokeWidth={1.6} />
          </span>
          <div>
            <p className="badge-gold w-fit">Cupos limitados</p>
            <h3 className="mt-2 font-display text-xl font-semibold text-white md:text-2xl">
              El {diplomado.name} inicia el {diplomado.startDate}
            </h3>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/60 md:justify-start">
              <Users size={14} />
              Solo quedan {diplomado.seatsLeft} cupos disponibles para esta
              cohorte.
            </p>
          </div>
        </div>

        <a
          href={`#programa-${diplomado.slug}`}
          className="btn-gold w-full shrink-0 md:w-auto"
        >
          Reservar mi cupo
          <ArrowRight size={18} />
        </a>
      </motion.div>
    </section>
  );
}
