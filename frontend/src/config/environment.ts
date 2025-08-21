// Environment configuration
export const config = {
  // API Configuration
  api: {
    // Use relative '/api' by default so Vercel can proxy to backend and avoid CORS
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
  },
  
  // App Configuration
  app: {
    name: 'Gaon Zaika',
    version: '1.0.0',
  },
  
  // Feature flags
  features: {
    enableNotifications: true,
    enableAnalytics: true,
  }
};

export default config; 