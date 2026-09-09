import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
export default defineConfig({
    plugins: [react()],
    base: repositoryName ? `/${repositoryName}/` : '/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5500,
        proxy: {
            '/api': 'http://localhost:3001',
        },
    },
});
