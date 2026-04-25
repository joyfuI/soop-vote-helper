import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import electron from 'vite-plugin-electron/simple';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      electron({
        main: { entry: 'electron/main.ts' },
        preload: { input: 'electron/preload.ts' },
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_API_PORT}`,
          changeOrigin: true,
        },
      },
    },
  };
});
