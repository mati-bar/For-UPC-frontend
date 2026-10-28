import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'https://for-upc-frontend.vercel.app/' },
  webServer: {
    command: 'npm run dev',
    url: 'https://for-upc-frontend.vercel.app/',
    reuseExistingServer: true,
  },
});