"use client";

import { motion } from "framer-motion";
import { Users, Globe2, ShieldCheck, BookOpen } from "lucide-react";
import { useCountUp } from "@/lib/useCountUp";
import { Section, SectionHeading } from "./Section";

const STATS = [
  { icon: Users, end: 300000, suffix: "+", label: "Seguidores en redes sociales" },
  { icon: Globe2, end: 12, suffix: "+", label: "Países con presencia en Latinoamérica" },
  { icon: ShieldCheck, end: 1, suffix: "", label: "Aval del Colegio Médico Dominicano", isBadge: true },
  { icon: BookOpen, end: 4, suffix: "", label: "Programas médico-quirúrgicos online" },
];

function StatCard({
  icon: Icon,
  end,
  suffix,
  label,
  isBadge,
}: (typeof STATS)[number]) {
  const { ref, value } = useCountUp(end);

  return (
    <div ref={ref} className="glass-card p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-jarvis-cyan/10 text-jarvis-cyanSoft ring-1 ring-jarvis-cyan/25">
        <Icon size={20} />
      </div>
      <div className="mt-4 text-3xl font-bold text-white md:text-4xl">
        {isBadge ? "CMD" : `${value.toLocaleString("es-DO")}${suffix}`}
      </div>
      <div className="mt-2 text-sm text-white/55">{label}</div>
    </div>
  );
}

export function StatsSection() {
  return (
    <Section id="nosotros" className="bg-jarvis-navyLight/20">
      <SectionHeading
        eyebrow="Sobre GPA Academy"
        title="Una comunidad médica que crece en toda Latinoamérica"
        description="GPA Academy es una academia de educación médico-quirúrgica con sede en Santo Domingo, República Dominicana. Formamos profesionales de la salud con programas 100% online, respaldados por instituciones y docentes de trayectoria clínica activa."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 gap-5 md:grid-cols-4"
      >
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>
    </Section>
  );
}
