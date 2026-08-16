"use client";

import { motion } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  Calendar,
  Clock,
  GraduationCap,
  ShieldCheck,
  Gift,
  ArrowRight,
} from "lucide-react";
import type { ProgramContent } from "@/data/programs";
import { PriceDisplay } from "./PriceDisplay";
import { EnrollmentForm } from "./EnrollmentForm";
import { clsx } from "clsx";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function ProgramDetail({
  program,
  index,
}: {
  program: ProgramContent;
  index: number;
}) {
  const tinted = index % 2 === 1;

  return (
    <section
      id={`programa-${program.slug}`}
      className={clsx(
        "relative scroll-mt-24 px-6 py-20 md:py-24",
        tinted ? "bg-jarvis-navyLight/30" : "bg-jarvis-navy"
      )}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-end"
        >
          <div>
            {program.aval && (
              <span className="badge-gold mb-4">
                <ShieldCheck size={14} /> Avalado por {program.aval}
              </span>
            )}
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {program.name}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              {program.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-jarvis-cyanSoft" />
                {program.duration}
              </span>
              {program.startDate && (
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-jarvis-cyanSoft" />
                  Inicio: {program.startDate}
                </span>
              )}
              <span className="flex items-center gap-2">
                <GraduationCap size={16} className="text-jarvis-cyanSoft" />
                GPA Academy OS
              </span>
            </div>
          </div>

          <div className="glass-card p-6">
            <PriceDisplay price={program.price} size="lg" />
            <a
              href={`#inscripcion-${program.slug}`}
              className="btn-primary mt-5 w-full"
            >
              Inscribirme ahora
              <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>

        {/* Pain points + Benefits */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="glass-card p-7"
          >
            <h3 className="text-lg font-bold text-white">
              ¿Te identificas con esto?
            </h3>
            <ul className="mt-5 space-y-4">
              {program.painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <XCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-400/70"
                  />
                  <span className="text-sm leading-relaxed text-white/65">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="glass-card p-7"
          >
            <h3 className="text-lg font-bold text-white">
              Lo que vas a lograr
            </h3>
            <ul className="mt-5 space-y-4">
              {program.benefits.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-jarvis-cyanSoft"
                  />
                  <span className="text-sm leading-relaxed text-white/65">
                    <span className="font-semibold text-white">
                      {benefit.title}.
                    </span>{" "}
                    {benefit.description}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Offer breakdown + Bonuses */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div className="glass-card p-7">
            <h3 className="text-lg font-bold text-white">Qué incluye</h3>
            <ul className="mt-5 space-y-3">
              {program.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-white/65"
                >
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-jarvis-gold"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/50">
              <strong className="text-white/70">Modalidad de acceso:</strong>{" "}
              {program.modality}
            </p>
          </div>

          <div className="glass-card border-jarvis-gold/20 p-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Gift size={20} className="text-jarvis-goldSoft" />
              Bonos por inscripción anticipada
            </h3>
            <div className="mt-5 space-y-4">
              {program.bonuses.map((bonus) => (
                <div
                  key={bonus.title}
                  className="rounded-xl border border-jarvis-gold/20 bg-jarvis-gold/5 p-4"
                >
                  <p className="font-semibold text-jarvis-goldSoft">
                    {bonus.title}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {bonus.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enrollment form + payment */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mt-6"
        >
          <EnrollmentForm program={program} />
        </motion.div>
      </div>
    </section>
  );
}
