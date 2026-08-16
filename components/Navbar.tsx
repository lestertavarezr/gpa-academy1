"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Stethoscope } from "lucide-react";

const NAV_LINKS = [
  { label: "Programas", href: "#programas" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Preguntas", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-jarvis-navy/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-jarvis-cyan/15 text-jarvis-cyan ring-1 ring-jarvis-cyan/30">
            <Stethoscope size={18} strokeWidth={2.25} />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            GPA <span className="text-gradient-cyan">Academy</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-jarvis-cyanSoft"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href="#programas" className="btn-primary !px-6 !py-2.5 text-sm">
            Inscríbete ahora
          </a>
        </div>

        <button
          aria-label="Abrir menú"
          className="text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-jarvis-navy/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-jarvis-cyanSoft"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#programas"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-3 w-full"
              >
                Inscríbete ahora
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
