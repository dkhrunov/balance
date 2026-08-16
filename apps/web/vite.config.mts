import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/apps/web',
    server: {
        port: 4200,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    preview: {
        port: 4200,
        host: 'localhost',
    },
    plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    build: {
        outDir: '../../dist/apps/web',
        emptyOutDir: true,
        reportCompressedSize: true,
        // Carbon emits modern CSS (@position-try, etc.) that Vite 8's default
        // lightningcss minifier rejects; esbuild handles it.
        cssMinify: 'esbuild',
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
}));
