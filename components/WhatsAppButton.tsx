"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

// Placeholder: define NEXT_PUBLIC_WHATSAPP_NUMBER en formato internacional
// sin "+" (ej. 18095551234) dentro de .env.local
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "REEMPLAZA_NUMERO_WHATSAPP";
const DEFAULT_MESSAGE = encodeURIComponent(
  "Hola GPA Academy, quiero información sobre sus programas 👋"
);

export function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.45)] md:h-16 md:w-16"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle size={28} strokeWidth={2} className="relative" />
    </motion.a>
  );
}
