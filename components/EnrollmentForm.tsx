"use client";

import { useState, FormEvent } from "react";
import { CreditCard, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import type { ProgramContent } from "@/data/programs";
import { GOOGLE_FORM_IDS, PAGADITO_URLS, isPlaceholderEnv } from "@/lib/env";

// Formulario de captura + botón de pago Pagadito, en la misma sección
// visual, sin salto de sección, tal como pide el flujo de conversión.
export function EnrollmentForm({ program }: { program: ProgramContent }) {
  const googleFormId = GOOGLE_FORM_IDS[program.googleFormEnvKey];
  const pagaditoUrl = PAGADITO_URLS[program.pagaditoEnvKey];

  const hasGoogleForm = !isPlaceholderEnv(googleFormId);
  const hasPagadito = !isPlaceholderEnv(pagaditoUrl);

  const [submitted, setSubmitted] = useState(false);

  // Formulario nativo de respaldo: se muestra solo si no hay Google Form
  // configurado. Placeholder de envío — conectar a tu endpoint o CRM.
  function handleNativeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: conectar a tu backend / CRM / Google Sheets antes de producción.
    setSubmitted(true);
  }

  return (
    <div
      id={`inscripcion-${program.slug}`}
      className="glass-card grid grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2"
    >
      {/* Captura de datos */}
      <div className="p-7 md:p-9">
        <span className="section-label">Paso 1</span>
        <h4 className="mt-3 text-xl font-bold text-white">
          Completa tus datos
        </h4>
        <p className="mt-2 text-sm text-white/55">
          Regístrate para reservar tu cupo en {program.shortName}.
        </p>

        <div className="mt-6">
          {hasGoogleForm ? (
            <iframe
              src={`https://docs.google.com/forms/d/e/${googleFormId}/viewform?embedded=true`}
              className="h-[520px] w-full rounded-xl border border-white/10 bg-white"
              loading="lazy"
              title={`Formulario de inscripción — ${program.name}`}
            >
              Cargando formulario…
            </iframe>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-jarvis-cyan/30 bg-jarvis-cyan/10 px-6 py-14 text-center">
              <ShieldCheck className="text-jarvis-cyanSoft" size={32} />
              <p className="font-semibold text-white">
                ¡Datos recibidos! Continúa con el pago para confirmar tu cupo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNativeSubmit} className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-jarvis-gold/25 bg-jarvis-gold/5 px-3.5 py-2.5 text-xs text-jarvis-goldSoft">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>
                  Formulario de respaldo. Configura{" "}
                  <code className="font-mono">
                    {program.googleFormEnvKey}
                  </code>{" "}
                  para usar Google Forms embebido.
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-jarvis-cyan/60 focus:ring-2 focus:ring-jarvis-cyan/20"
                />
                <input
                  required
                  type="tel"
                  placeholder="Teléfono / WhatsApp"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-jarvis-cyan/60 focus:ring-2 focus:ring-jarvis-cyan/20"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Correo electrónico"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-jarvis-cyan/60 focus:ring-2 focus:ring-jarvis-cyan/20"
              />
              <input
                type="text"
                readOnly
                value={`Programa: ${program.name}`}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50"
              />
              <button type="submit" className="btn-secondary w-full">
                Guardar mis datos
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Pago — misma sección visual, sin salto */}
      <div className="border-t border-white/10 bg-white/[0.02] p-7 md:border-l md:border-t-0 md:p-9">
        <span className="section-label">Paso 2</span>
        <h4 className="mt-3 text-xl font-bold text-white">
          Confirma tu inscripción con el pago
        </h4>
        <p className="mt-2 text-sm text-white/55">
          Pago seguro procesado por Pagadito. Tu cupo se confirma al recibir
          el pago.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-jarvis-navyDeep/60 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">{program.shortName}</span>
            <span className="font-semibold text-white">
              {program.price.type === "DOP_FIXED"
                ? `RD$${program.price.amountDOP.toLocaleString("es-DO")}`
                : `US$${program.price.amountUSD}`}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
            <Lock size={12} /> Transacción cifrada y segura
          </div>
        </div>

        {hasPagadito ? (
          <a
            href={pagaditoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-6 w-full"
          >
            <CreditCard size={18} />
            Pagar con Pagadito
          </a>
        ) : (
          <button
            type="button"
            disabled
            title={`Configura ${program.pagaditoEnvKey} en tu .env`}
            className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-white/40"
          >
            <CreditCard size={18} />
            Botón de Pagadito pendiente de configurar
          </button>
        )}

        <p className="mt-4 text-center text-xs text-white/35">
          Al continuar aceptas nuestros términos de inscripción y política de
          privacidad.
        </p>
      </div>
    </div>
  );
}
