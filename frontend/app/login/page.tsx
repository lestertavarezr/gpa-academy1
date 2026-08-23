'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  // useSearchParams() exige un limite de Suspense en build de produccion
  // (Next.js necesita poder mostrar un fallback mientras se resuelve en el
  // cliente); sin este wrapper `next build` falla al prerenderizar la pagina.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', { email, password, code, redirect: false });

    setLoading(false);
    if (result?.error) {
      setError('Credenciales o código inválidos');
      return;
    }
    router.push('/paper-bots');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-8">
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Necesitás tu contraseña y el código de tu app de 2FA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {justRegistered && (
            <p className="rounded-md bg-emerald-950/60 px-3 py-2 text-sm text-emerald-300">
              Cuenta activada. Ya podés iniciar sesión.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Código 2FA</span>
              <input
                type="text"
                required
                minLength={6}
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono tracking-widest"
              />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-blue-400 underline">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
