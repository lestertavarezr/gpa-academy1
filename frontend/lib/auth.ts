import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        code: { label: 'Código 2FA', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password || !credentials.code) {
          return null;
        }

        // NextAuth no valida nada por si mismo: delega la validacion de
        // password + codigo TOTP en el backend, que es la unica fuente de
        // verdad de usuarios. Si el backend acepta, envolvemos su JWT
        // dentro de la sesion de NextAuth (ver callback jwt abajo).
        const response = await fetch(`${getBackendUrl()}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            code: credentials.code,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return {
          id: String(data.userId),
          email: data.email,
          backendAccessToken: data.accessToken as string,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendAccessToken = user.backendAccessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.backendAccessToken = token.backendAccessToken as string;
      return session;
    },
  },
};
