"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import type { ProgramContent } from "@/data/programs";
import { PriceDisplay } from "./PriceDisplay";
import { ProgramVisual } from "./ProgramVisual";

export function ProgramCard({
  program,
  index,
}: {
  program: ProgramContent;
  index: number;
}) {
  return (
    <motion.a
      href={`#programa-${program.slug}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card group flex flex-col overflow-hidden"
    >
      <ProgramVisual
        slug={program.slug}
        index={index}
        accent={program.cardAccent}
        className="h-28"
      />

      <div className="flex flex-1 flex-col p-6">
        {program.cardAccent === "gold" && (
          <span className="badge-gold mb-3 w-fit">Diplomado insignia</span>
        )}

        <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-white">
          {program.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/50">
          {program.tagline}
        </p>

        <div className="mt-4 flex items-center gap-4 font-mono text-[11px] uppercase tracking-wide text-white/35">
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {program.duration.split("·")[0].trim()}
          </span>
          {program.seatsLeft && (
            <span className="flex items-center gap-1.5">
              <Users size={12} /> {program.seatsLeft} cupos
            </span>
          )}
        </div>

        <div className="mt-5 border-t border-white/[0.07] pt-5">
          <PriceDisplay price={program.price} size="sm" />
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors group-hover:text-jarvis-cyanSoft">
          Ver programa
          <ArrowUpRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </motion.a>
  );
}
