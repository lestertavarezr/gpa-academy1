import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">TradingHub SaaS — Fase 1</h1>
      <p className="max-w-md text-slate-400">
        Setup inicial del monorepo: bot-engine en testnet de Binance, backend NestJS y este
        frontend.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="text-blue-400 underline">
          Ver dashboard de mercado →
        </Link>
        <Link href="/market-analysis" className="text-blue-400 underline">
          Ver análisis de mercado →
        </Link>
        <Link href="/backtesting" className="text-blue-400 underline">
          Ver backtesting →
        </Link>
        <Link href="/paper-bots" className="text-blue-400 underline">
          Ver mis bots →
        </Link>
      </div>
      <div className="flex gap-4 text-sm">
        <Link href="/login" className="text-slate-400 underline">
          Iniciar sesión
        </Link>
        <Link href="/register" className="text-slate-400 underline">
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
