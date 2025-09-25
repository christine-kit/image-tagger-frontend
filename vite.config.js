import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'


// https://vite.dev/config/
export default defineConfig( ({ mode })=> {
  const env = loadEnv(mode, process.cwd());
  const proxyUrl = env.VITE_API_PROXY_URL;
  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    server: {
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': {
          target: proxyUrl,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.method, req.url, '→', options.target)
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Response from target:', proxyRes.statusCode, req.url)
            })
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err)
            })
          },
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  };
})
  
  
