import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { handleTranslation } from './api/translate';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-translate-dev-server',
      configureServer(server) {
        server.middlewares.use('/api/translate', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const clientIp =
                  ((req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()) ||
                  req.socket?.remoteAddress ||
                  '127.0.0.1';

                const response = await handleTranslation(parsed, clientIp);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = response.status;
                res.end(JSON.stringify(response.data));
              } catch (err: any) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err?.message || 'Server error' }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end('Method Not Allowed');
          }
        });
      },
    },
  ],
});
