import { createClient, type Client } from '@libsql/client';

const globalForTurso = globalThis as unknown as {
  turso: Client | undefined;
};

function createTursoClient(): Client {
  if (!process.env.TURSO_URL) {
    throw new Error(
      'TURSO_URL environment variable is not set. ' +
      'Please add TURSO_URL and TURSO_AUTH_TOKEN in your Vercel project settings → Environment Variables.'
    );
  }
  return createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// Lazy initialization — only creates the client when first accessed at runtime
export function getTurso(): Client {
  if (!globalForTurso.turso) {
    globalForTurso.turso = createTursoClient();
  }
  return globalForTurso.turso;
}

// Named export for convenience (lazy getter)
export const turso = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getTurso();
    const value = (client as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default turso;
