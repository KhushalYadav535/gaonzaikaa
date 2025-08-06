// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.DEV 
        ? '/api' // Development - proxied to localhost:3000
        : 'https://gaon-zaika.onrender.com/api' // Production
      ),
    timeout: 10000,
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