'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerUser, verify2faSetup, type RegisterResponse } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setup, setSetup] = useState<RegisterResponse | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await registerUser(email, password);
      setSetup(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!setup) return;
    setLoading(true);
    setError(null);
    try {
      await verify2faSetup(setup.userId, code);
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-8">
      <Card>
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            El 2FA es obligatorio: vas a necesitar una app de autenticación (Google Authenticator,
            Authy, etc.) para terminar de crear tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!setup ? (
            <form onSubmit={handleRegister} className="space-y-3">
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
                <span className="text-slate-400">Contraseña (mínimo 8 caracteres)</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
                />
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Continuar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-3">
              <p className="text-sm text-slate-400">
                Escaneá este código QR con tu app de autenticación:
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qrCodeDataUrl}
                alt="Código QR para configurar 2FA"
                className="mx-auto h-48 w-48 rounded-md bg-white p-2"
              />
              <p className="text-xs text-slate-500">
                ¿No podés escanear el QR? Ingresá este código manualmente:{' '}
                <span className="font-mono text-slate-300">{setup.manualEntryCode}</span>
              </p>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">Código de 6 dígitos</span>
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
                {loading ? 'Verificando...' : 'Verificar y activar cuenta'}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-slate-400">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-blue-400 underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
