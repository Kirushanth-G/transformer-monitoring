import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      // SVG optimization options
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo'],
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // Preserve viewBox for responsiveness
                  removeViewBox: false,
                  // Keep IDs for accessibility
                  cleanupIds: false,
                },
              },
            },
          ],
        },
      },
      include: '**/*.svg',
    }),
  ],
});
