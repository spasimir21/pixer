import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spasimirpavlov.pixer',
  appName: 'PiXer',
  webDir: 'dist',
  plugins: {
    Media: {
      androidGalleryMode: true
    }
  }
};

export default config;
