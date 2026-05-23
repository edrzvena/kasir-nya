import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shigoto.kasirnya',
  appName: 'Kasirnya',
  webDir: 'dist',
  server: {
    url: 'https://kasir-nya.vercel.app',
    cleartext: false,
  },
};

export default config;
