"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ArrowRight, PlayCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-jarvis-gradient pb-24 pt-36 md:pb-32 md:pt-44"
    >
      {/* Decorative glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-jarvis-cyan/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-64 h-80 w-80 rounded-full bg-jarvis-gold/15 blur-[110px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="mb-7 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="badge-gold">
            <ShieldCheck size={14} /> Avalado por el Colegio Médico Dominicano
          </span>
          <span className="section-label">
            <Sparkles size={13} /> +300,000 profesionales de la salud nos siguen
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Formación médico-quirúrgica
          <br className="hidden sm:block" />{" "}
          <span className="text-gradient-cyan">de nivel élite</span>,
          100% online
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/65 md:text-xl"
        >
          Diplomados y programas diseñados para profesionales de la salud en
          toda Latinoamérica. Video clases, presentaciones, podcasts y
          evaluaciones dentro de GPA Academy OS — aprende desde donde estés.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a href="#programas" className="btn-primary w-full sm:w-auto">
            Ver programas disponibles
            <ArrowRight size={18} />
          </a>
          <a href="#nosotros" className="btn-secondary w-full sm:w-auto">
            <PlayCircle size={18} />
            Conoce GPA Academy
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-10"
        >
          {[
            ["300K+", "Seguidores en redes"],
            ["12+", "Países en Latinoamérica"],
            ["CMD", "Aval institucional"],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-2xl font-bold text-white md:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-white/50 md:text-sm">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
