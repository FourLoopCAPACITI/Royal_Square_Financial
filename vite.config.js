import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Local stand-in for Vercel Functions.
 *
 * In production, Vercel serves /api/chat from api/chat.js.
 * During `npm run dev` this small plugin routes /api/chat to the same
 * handler so the chatbot works locally. The GROQ_API_KEY is read on the
 * Node side only — it is never bundled into the browser code.
 */
function localApiRoutes(env) {
  return {
    name: 'rsf-local-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          if (env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY;
          if (env.GROQ_MODEL) process.env.GROQ_MODEL = env.GROQ_MODEL;
          const mod = await server.ssrLoadModule('/api/chat.js');
          await mod.default(req, res);
        } catch (err) {
          console.error('Local API error', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'assistant_unavailable', message: 'The assistant is temporarily unavailable. Please try again later.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load all env vars (including non-VITE ones) for the local API only.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localApiRoutes(env)],
    server: { port: 5173 },
  };
});
