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
                    dir: 'dist/esm',
                    entryFileNames: 'index.js'
                },
                {
                    dir: 'dist/cjs',
                    format: 'cjs',
                    entryFileNames: 'index.cjs'
                },
                {
                    dir: 'dist/umd',
                    format: 'umd',
                    name: 'BarcodeScanner',
                    entryFileNames: 'index.umd.js',
                    globals: {
                        'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.15/dist/main.js': 'ZBarWasm'
                    }
                },
                {
                    dir: 'dist/iife',
                    format: 'iife',
                    name: 'BarcodeScanner',
                    entryFileNames: 'index.iife.js',
                    globals: {
                        'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.15/dist/main.js': 'ZBarWasm'
                    }
                }
            ]
        }
    }
});
