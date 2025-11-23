import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Volcengine API代理 - 解决CORS问题
          '/api/volcengine': {
            target: 'https://ark.cn-beijing.volces.com/api/v3',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/volcengine/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                // 添加Authorization header
                if (env.VITE_ARK_API_KEY) {
                  proxyReq.setHeader('Authorization', `Bearer ${env.VITE_ARK_API_KEY}`);
                }
              });
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
