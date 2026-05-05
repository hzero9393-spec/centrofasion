import { createClient, type Client } from '@libsql/client';

const globalForTurso = globalThis as unknown as {
  turso: Client | undefined;
};

function createTursoClient(): Client {
  const url = process.env.TURSO_URL;
  if (!url) {
    throw new Error(
      'TURSO_URL environment variable is not set. ' +
      'Please add TURSO_URL and TURSO_AUTH_TOKEN in your Vercel project settings.'
    );
  }
  return createClient({
    url,
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

// Default export as lazy getter for backward compatibility
// Uses Object.defineProperty so the getter only runs when accessed, not during module analysis
export default Object.defineProperty({}, 'turso', {
  get() {
    return getTurso();
  },
  enumerable: true,
  configurable: true,
}) as unknown as Client;
