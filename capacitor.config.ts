
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5bcaca00f3ef4f498873291f5c7a6bc0',
  appName: 'Bantu Movers',
  webDir: 'dist',
  server: {
    url: 'https://5bcaca00-f3ef-4f49-8873-291f5c7a6bc0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false
    }
  }
};

export default config;
