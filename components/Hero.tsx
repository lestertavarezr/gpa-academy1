"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Radio } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] },
  }),
};

function ReadoutRow({
  label,
  value,
  suffix = "",
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  delay: number;
}) {
  const { ref, value: current } = useCountUp(value, 1600);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-baseline justify-between border-b border-white/[0.06] py-3.5 last:border-0"
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      <span className="tabular-nums font-mono text-lg font-medium text-white">
        {current.toLocaleString("es-DO")}
        <span className="text-jarvis-cyanSoft">{suffix}</span>
      </span>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-jarvis-gradient pb-20 pt-32 md:pb-28 md:pt-40"
    >
      <div className="pointer-events-none absolute -left-40 top-16 h-[28rem] w-[28rem] rounded-full bg-jarvis-cyan/[0.14] blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 top-72 h-80 w-80 rounded-full bg-jarvis-gold/[0.1] blur-[120px]" />
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-[0.035]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        {/* Copy */}
        <div>
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="kicker"
          >
            Academia médico-quirúrgica · Santo Domingo, RD
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 text-balance font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[4.2rem]"
          >
            Precisión quirúrgica.
            <br />
            <span className="text-gradient-cyan">Formación de élite.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-7 max-w-lg text-lg leading-relaxed text-white/55"
          >
            Diplomados y programas 100% online para profesionales de la
            salud en toda Latinoamérica. Video clases, presentaciones,
            podcasts y evaluaciones — todo dentro de GPA Academy OS.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <a href="#programas" className="btn-primary w-full sm:w-auto">
              Ver programas
              <ArrowRight size={16} />
            </a>
            <a
              href="#nosotros"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-jarvis-cyanSoft"
            >
              <PlayCircle size={17} />
              Conoce GPA Academy
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-10 flex items-center gap-2 text-xs text-white/40"
          >
            <ShieldCheck size={14} className="text-jarvis-goldSoft" />
            Diplomado en Asistencia Quirúrgica avalado por el Colegio Médico
            Dominicano (CMD)
          </motion.div>
        </div>

        {/* HUD readout panel */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bracket-frame relative mx-auto w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-jarvis-navyDeep/60 backdrop-blur-xl">
            <div className="grid-texture pointer-events-none absolute inset-0 opacity-[0.06]" />

            {/* Scan line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] overflow-hidden motion-reduce:hidden">
              <div className="motion-safe:animate-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-jarvis-cyan/70 to-transparent" />
            </div>

            <div className="relative flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
                GPA Academy OS · Estado
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide text-jarvis-cyanSoft">
                <Radio size={11} className="animate-pulse-slow" />
                En línea
              </span>
            </div>

            <div className="relative px-5 py-2">
              <ReadoutRow label="Seguidores" value={300000} suffix="+" delay={0.4} />
              <ReadoutRow label="Países activos" value={12} suffix="+" delay={0.48} />
              <ReadoutRow label="Programas online" value={4} delay={0.56} />
            </div>

            <div className="relative border-t border-white/[0.08] bg-jarvis-gold/[0.04] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-jarvis-goldSoft/80">
                  Próxima cohorte
                </span>
                <span className="badge-gold">CMD</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white">
                Asistencia Quirúrgica
              </p>
              <p className="font-mono text-xs text-white/45">
                Inicio 22.08.2026 · cupos limitados
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
