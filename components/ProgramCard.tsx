"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Users } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card group flex flex-col overflow-hidden"
    >
      <ProgramVisual
        slug={program.slug}
        accent={program.cardAccent}
        className="h-44 w-full"
      />

      <div className="flex flex-1 flex-col p-6">
        {program.cardAccent === "gold" && (
          <span className="badge-gold mb-3 w-fit">Diplomado insignia</span>
        )}

        <h3 className="text-lg font-bold leading-snug text-white">
          {program.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/55">
          {program.tagline}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {program.duration}
          </span>
          {program.seatsLeft && (
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {program.seatsLeft} cupos
            </span>
          )}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <PriceDisplay price={program.price} size="sm" />
        </div>

        <a
          href={`#programa-${program.slug}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 group-hover:border-jarvis-cyan/50 group-hover:bg-jarvis-cyan/10 group-hover:text-jarvis-cyanSoft"
        >
          Ver más
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>
    </motion.div>
  );
}
