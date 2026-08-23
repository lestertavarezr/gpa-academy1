export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 p-4 text-sm text-amber-200">
      <p className="font-semibold">Aviso de riesgo</p>
      <p className="mt-1">{text}</p>
    </div>
  );
}
