import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // alias chuẩn để import
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist', // Vercel sẽ hiểu dist là output
  },
  server: {
    port: 3000,
    open: true,
  },
  base: './', // rất quan trọng: để assets load đúng khi deploy
})
