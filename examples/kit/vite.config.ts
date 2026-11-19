import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // @punica/form-react is linked from the workspace, where it has its own
    // React for its tests. An application installing it from npm has one.
    dedupe: ['react', 'react-dom']
  }
});
