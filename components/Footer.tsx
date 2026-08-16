import { Stethoscope, Instagram, Facebook, Youtube } from "lucide-react";
import { programs } from "@/data/programs";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-jarvis-navyDeep px-6 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jarvis-cyan/15 text-jarvis-cyan ring-1 ring-jarvis-cyan/30">
              <Stethoscope size={18} strokeWidth={2.25} />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              GPA <span className="text-gradient-cyan">Academy</span>
            </span>
          </a>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            Academia de educación médico-quirúrgica con sede en Santo
            Domingo, República Dominicana. Formación online avalada por el
            Colegio Médico Dominicano (CMD).
          </p>
          <div className="mt-5 flex gap-3">
            {/* Placeholder: reemplazar por URLs reales de redes sociales */}
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Red social"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-jarvis-cyan/40 hover:text-jarvis-cyanSoft"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Programas
          </h4>
          <ul className="mt-4 space-y-3">
            {programs.map((p) => (
              <li key={p.slug}>
                <a
                  href={`#programa-${p.slug}`}
                  className="text-sm text-white/45 transition-colors hover:text-jarvis-cyanSoft"
                >
                  {p.shortName}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Institución
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/45">
            <li>
              <a href="#nosotros" className="hover:text-jarvis-cyanSoft">
                Sobre GPA Academy
              </a>
            </li>
            <li>
              <a href="#testimonios" className="hover:text-jarvis-cyanSoft">
                Testimonios
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-jarvis-cyanSoft">
                Preguntas frecuentes
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Contacto
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-white/45">
            <li>Santo Domingo, República Dominicana</li>
            <li>gpacademyrd@gmail.com</li>
            <li>Presencia en 12+ países de Latinoamérica</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/35">
        © {year} GPA Academy. Todos los derechos reservados.
      </div>
    </footer>
  );
}
