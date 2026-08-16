import { programs } from "@/data/programs";
import { ProgramDetail } from "./ProgramDetail";

export function ProgramDetails() {
  return (
    <div id="detalle-programas">
      {programs.map((program, i) => (
        <ProgramDetail key={program.slug} program={program} index={i} />
      ))}
    </div>
  );
}
