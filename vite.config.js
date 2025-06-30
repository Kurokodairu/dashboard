import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    allowedHosts: ['test.kurokodairu.com'],
    proxy: {
      '/weather': {
        target: 'https://api.met.no',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/weather/, '/weatherapi/locationforecast/2.0/compact'),
        secure: true,
        headers: {
          'User-Agent': 'Dashboard App (kurokodairuwu@proton.me)'
        }
      },
      '/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/coingecko/, ''),
        secure: true,
        timeout: 10000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('User-Agent', 'Dashboard App (kurokodairuwu@proton.me)');
          });
        }
      }
    }
  },
})