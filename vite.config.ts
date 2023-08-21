import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [mkcert(), dts()],
    server: { https: true },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [esbuildCommonjs(['zbar.wasm'])]
        }
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'BarcodeScanner',
            fileName: 'index'
        },
        rollupOptions: {
            input: 'src/index.ts',
            external: ['zbar.wasm'],
            output: [
                {
                    format: 'es',
                    dir: 'dist',
                    entryFileNames: 'index.js',
                    sourcemap: true
                },
                {
                    dir: 'dist',
                    format: 'cjs',
                    entryFileNames: 'index.cjs',
                    sourcemap: true
                },
                {
                    dir: 'dist',
                    format: 'umd',
                    name: 'BarcodeScanner',
                    entryFileNames: 'index.umd.js',
                    sourcemap: true
                },
                {
                    dir: 'dist',
                    format: 'iife',
                    name: 'BarcodeScanner',
                    entryFileNames: 'index.iife.js',
                    sourcemap: true
                },
                {
                    dir: 'dist',
                    format: 'module',
                    entryFileNames: 'index.mjs',
                    sourcemap: true
                }
            ]
        }
    }
});
