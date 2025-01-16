import viteTypescript from '../lib/vite-plugin-typescript';
// @ts-ignore
import typescript from 'ts-patch/compiler';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [viteTypescript([path.join(__dirname, './src/main.ts')], typescript)]
});
