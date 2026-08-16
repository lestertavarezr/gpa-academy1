"use client";

import { motion } from "framer-motion";
import { Users, Globe2, ShieldCheck, BookOpen } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";
import { Section, SectionHeading } from "./Section";

const STATS = [
  { icon: Users, end: 300000, suffix: "+", label: "Seguidores en redes" },
  { icon: Globe2, end: 12, suffix: "+", label: "Países en Latinoamérica" },
  { icon: BookOpen, end: 4, suffix: "", label: "Programas online" },
];

function TickerStat({
  icon: Icon,
  end,
  suffix,
  label,
}: (typeof STATS)[number]) {
  const { ref, value } = useCountUp(end);

  return (
    <div
      ref={ref}
      className="flex flex-1 items-center gap-4 px-6 py-6 md:py-0"
    >
      <Icon size={18} className="shrink-0 text-jarvis-cyanSoft/70" />
      <div>
        <div className="tabular-nums font-mono text-2xl font-medium text-white md:text-[1.7rem]">
          {value.toLocaleString("es-DO")}
          <span className="text-jarvis-cyanSoft">{suffix}</span>
        </div>
        <div className="mt-0.5 text-xs text-white/45">{label}</div>
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <Section id="nosotros" className="bg-jarvis-navy">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeading
          eyebrow="Sobre GPA Academy"
          title="Una comunidad médica que crece en toda Latinoamérica"
          description="Academia de educación médico-quirúrgica con sede en Santo Domingo, República Dominicana. Formamos profesionales de la salud con programas 100% online, respaldados por instituciones y docentes de trayectoria clínica activa."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="bracket-frame flex flex-col divide-y divide-white/[0.07] rounded-lg border border-white/10 bg-jarvis-navyDeep/40 md:flex-row md:divide-x md:divide-y-0"
        >
          {STATS.map((stat) => (
            <TickerStat key={stat.label} {...stat} />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
