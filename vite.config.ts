import { fileURLToPath, URL } from 'node:url';

import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [vue()];
  if (mode === 'development') {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools');
    plugins.push(vueDevTools());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
