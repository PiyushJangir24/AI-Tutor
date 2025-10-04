import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true
    },
    preview: {
        port: 5173
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './vitest.setup.ts'
    }
});
