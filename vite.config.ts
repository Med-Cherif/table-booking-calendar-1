/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { EsLinter, linterPlugin } from 'vite-plugin-linter';
import dts from 'vite-plugin-dts';

import tsConfigPaths from 'vite-tsconfig-paths';
import * as packageJson from './package.json';

export default defineConfig((configEnv) => ({
  plugins: [
    react(),
    // tsConfigPaths(),
    linterPlugin({
      include: ['./src}/**/*.{ts,tsx}'],
      linters: [new EsLinter({ configEnv })],
    }),
    dts({
      include: ['src/components/table_booking_calendar'],
    }),
  ],
  resolve: {
    alias: {
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  build: {
    lib: {
      entry: resolve('src', 'components/table_booking_calendar/index.ts'),
      name: 'TableBookingCalendar',
      formats: ['es', 'umd'],
      fileName: (format) => `table-booking-calendar.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
  },
}));
