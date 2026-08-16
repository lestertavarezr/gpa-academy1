"use client";

import { motion } from "framer-motion";
import { Scissors, Activity, Brain, Aperture, LucideIcon } from "lucide-react";
import { clsx } from "clsx";

const ICONS: Record<string, LucideIcon> = {
  "asistencia-quirurgica": Scissors,
  sutura: Activity,
  neuroimagenes: Brain,
  "instrumentacion-laparoscopica": Aperture,
};

// Panel de especificación con trazo tipo monitor de signos vitales — el
// motivo visual (quirúrgico + HUD "JARVIS") sustituye al placeholder de
// imagen. Para fotografía real de marca: colocar el archivo en
// /public/images (ver heroImage en data/programs.ts) y usar <Image />.
export function ProgramVisual({
  slug,
  index,
  accent,
  className,
}: {
  slug: string;
  index: number;
  accent: "cyan" | "gold";
  className?: string;
}) {
  const Icon = ICONS[slug] || Activity;
  const tint = accent === "cyan" ? "#00C2D1" : "#C9A227";

  return (
    <div
      className={clsx(
        "relative flex flex-col justify-between overflow-hidden border-b border-white/[0.07] bg-jarvis-navyDeep/40 px-5 pt-5",
        className
      )}
    >
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />

      <div className="relative flex items-start justify-between">
        <span className="index-tag">{String(index + 1).padStart(2, "0")}</span>
        <span
          className={clsx(
            "bracket-frame flex h-9 w-9 items-center justify-center rounded-md border",
            accent === "cyan"
              ? "border-jarvis-cyan/25 text-jarvis-cyanSoft"
              : "border-jarvis-gold/30 text-jarvis-goldSoft"
          )}
        >
          <Icon size={16} strokeWidth={1.6} />
        </span>
      </div>

      <svg
        viewBox="0 0 300 60"
        className="relative h-12 w-full"
        preserveAspectRatio="none"
      >
        <motion.polyline
          points="0,30 42,30 55,30 65,10 75,50 85,18 95,30 132,30 150,30 158,20 166,30 300,30"
          fill="none"
          stroke={tint}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.75 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut", delay: index * 0.1 }}
        />
      </svg>
    </div>
  );
}
