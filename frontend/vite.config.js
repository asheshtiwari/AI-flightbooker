import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Standard frontend port
    port: 3000, 
    // Required for Docker/network container access
    host: true 
  }
});