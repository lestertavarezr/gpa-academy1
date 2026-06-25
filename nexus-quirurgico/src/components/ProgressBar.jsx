export default function ProgressBar({ timeLeft, totalTime }) {
  const pct = (timeLeft / totalTime) * 100;
  return (
    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: pct > 40 ? '#ff3355' : pct > 20 ? '#d89e00' : '#e21b3c' }}
      />
    </div>
  );
}
