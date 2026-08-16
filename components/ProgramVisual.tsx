import { Scissors, Activity, Brain, Aperture, LucideIcon } from "lucide-react";
import { clsx } from "clsx";

const ICONS: Record<string, LucideIcon> = {
  "asistencia-quirurgica": Scissors,
  sutura: Activity,
  neuroimagenes: Brain,
  "instrumentacion-laparoscopica": Aperture,
};

// NOTA: Placeholder visual con gradiente + icono. Sustituir por fotografía
// real de marca colocando el archivo en /public/images (ver heroImage en
// data/programs.ts) y reemplazando este componente por <Image src=.../>.
export function ProgramVisual({
  slug,
  accent,
  className,
}: {
  slug: string;
  accent: "cyan" | "gold";
  className?: string;
}) {
  const Icon = ICONS[slug] || Activity;

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden",
        accent === "cyan"
          ? "bg-gradient-to-br from-jarvis-navyLight via-jarvis-navy to-jarvis-cyan/20"
          : "bg-gradient-to-br from-jarvis-navyLight via-jarvis-navy to-jarvis-gold/20",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className={clsx(
          "absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl",
          accent === "cyan" ? "bg-jarvis-cyan/25" : "bg-jarvis-gold/25"
        )}
      />
      <Icon
        size={64}
        strokeWidth={1.4}
        className={clsx(
          "relative drop-shadow-lg",
          accent === "cyan" ? "text-jarvis-cyanSoft" : "text-jarvis-goldSoft"
        )}
      />
    </div>
  );
}
