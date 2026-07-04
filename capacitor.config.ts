import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.mams.app',
  appName: 'MAMS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#3880ff',
      androidScaleType: 'CENTER_CROP',
    },
  },
}

export default config
