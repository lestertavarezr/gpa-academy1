export function UnderperformanceWarning() {
  return (
    <div className="rounded-lg border border-red-700 bg-red-950/50 p-4 text-sm text-red-200">
      <p className="font-semibold">⚠ Esta estrategia no superó una simple compra y retención (buy &amp; hold) en el período probado.</p>
      <p className="mt-1 text-red-300">
        El retorno de la estrategia fue menor que el de comprar el activo al inicio y no volver a
        operar. Revisá los umbrales de compra/venta o considerá que, con costos reales incluidos,
        esta configuración no agregó valor frente a no hacer nada.
      </p>
    </div>
  );
}
