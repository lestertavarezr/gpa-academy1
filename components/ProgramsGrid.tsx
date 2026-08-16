import { programs } from "@/data/programs";
import { Section, SectionHeading } from "./Section";
import { ProgramCard } from "./ProgramCard";

export function ProgramsGrid() {
  return (
    <Section id="programas" className="bg-jarvis-navy">
      <SectionHeading
        eyebrow="Nuestros programas"
        title="Elige el programa que impulsa tu carrera"
        description="Cuatro formaciones 100% online diseñadas para profesionales de la salud que quieren dar el siguiente paso: video clases, presentaciones descargables, podcasts temáticos y evaluaciones dentro de GPA Academy OS."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {programs.map((program, i) => (
          <ProgramCard key={program.slug} program={program} index={i} />
        ))}
      </div>
    </Section>
  );
}
