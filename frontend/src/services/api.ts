import axios from 'axios';
import config from '../config/environment';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't force-redirect on 401 — let the React session context handle auth state
    // A hard window.location.href redirect here would wipe state and cause reload loops
    return Promise.reject(error);
  }
);

// Helper: retry once on network errors (Render cold start)
async function retryOnceOnNetworkError<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err.code === 'ERR_NETWORK') {
      await new Promise(r => setTimeout(r, 1500));
      return await fn();
    }
    throw err;
  }
}

// Admin API endpoints
export const adminAPI = {
  // Login
  login: (credentials: { email: string; password: string }) =>
    // Admin login is handled at /admin/login (not /auth/admin/login)
    retryOnceOnNetworkError(() => api.post('/admin/login', credentials)),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Earnings
  getEarnings: (params?: { period?: string }) => api.get('/admin/earnings', { params }),

  // Restaurants
  getRestaurants: (params?: { limit?: number; page?: number }) =>
    api.get('/admin/restaurants', { params }),
  updateRestaurant: (id: string, data: any) =>
    api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id: string) =>
    api.delete(`/admin/restaurants/${id}`),

  // Orders
  getOrders: (params?: { status?: string; limit?: number; page?: number; restaurantId?: string }) =>
    api.get('/admin/orders', { params }),
  updateOrder: (id: string, data: any) =>
    api.put(`/admin/orders/${id}`, data),
  deleteOrder: (id: string) =>
    api.delete(`/admin/orders/${id}`),

  // Users
  getUsers: (params?: { role?: string; limit?: number; page?: number }) =>
    api.get('/admin/users', { params }),
  getAdminStats: (adminId: string) =>
    api.get(`/admin/stats/${adminId}`),

  // Marketing
  sendBroadcastNotification: (data: any) =>
    api.post('/admin/marketing/push-notification', data),
  getBroadcastNotifications: () =>
    api.get('/admin/marketing/push-notifications-history'),

  getUserStats: (id: string, role: string) =>
    api.get(`/admin/users/${id}/stats`, { params: { role } }),
  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string, role: string) => {
    console.log(`Deleting user with ID: ${id}, role: ${role}`);
    
    // Try different request formats to see which one works
    const requestConfig = {
      method: 'DELETE',
      url: `/admin/users/${id}`,
      data: { role },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: (status: number) => {
        // Log all responses for debugging
        console.log(`Delete request status: ${status}`);
        return status < 500; // Don't throw on server errors, let us handle them
      }
    };
    
    console.log('Delete request config:', requestConfig);
    
    return api.delete(`/admin/users/${id}`, { 
      data: { role },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: (status: number) => {
        console.log(`Delete request status: ${status}`);
        return status < 500;
      }
    });
  },
  
  // Fallback delete method using POST
  deleteUserPost: (id: string, role: string) => {
    console.log(`Deleting user with ID: ${id}, role: ${role} using POST method`);
    return api.post(`/admin/users/${id}/delete`, { 
      role,
      action: 'delete'
    });
  },

  // ─── NEW ADMIN APIS ───────────────────────────────────────────────────────

  // Create Vendor (admin only — creates vendor + restaurant together)
  createVendor: (data: {
    name: string; email: string; phone: string; password: string;
    restaurantName: string; restaurantAddress?: string; cuisine?: string;
  }) => api.post('/admin/create-vendor', data),

  // Create Delivery Boy (admin only)
  createDelivery: (data: {
    name: string; email: string; phone: string; password: string; vehicleNumber: string;
  }) => api.post('/admin/create-delivery', data),

  // Reset password for vendor or delivery
  resetUserPassword: (id: string, role: 'vendor' | 'delivery', newPassword: string) =>
    api.post('/admin/reset-password', { id, role, newPassword }),

  // Add restaurant (for existing vendor)
  addRestaurant: (data: {
    name: string; cuisine: string; vendorId: string; phone: string; email?: string; address?: string;
  }) => api.post('/admin/restaurants', data),

  // Onboarding
  getPendingOnboarding: () => api.get('/admin/onboarding/pending'),
  updateOnboardingStatus: (id: string, role: string, action: 'approve' | 'reject') => 
    api.put(`/admin/onboarding/${id}/${role}/${action}`),

  // Get restaurant menu
  getRestaurantMenu: (id: string) => api.get(`/admin/restaurants/${id}/menu`),

  // Add menu item to restaurant
  addMenuItem: (restaurantId: string, item: {
    name: string; price: number; category: string; description?: string; isVeg?: boolean; preparationTime?: number;
  }) => api.post(`/admin/restaurants/${restaurantId}/menu`, item),

  // Delete menu item
  deleteMenuItem: (restaurantId: string, itemId: string) =>
    api.delete(`/admin/restaurants/${restaurantId}/menu/${itemId}`),

  // Get all vendors (for dropdowns)
  getVendors: () => api.get('/admin/users?role=vendor&limit=100'),

  // ─── OFFERS & BANNERS ───────────────────────────────────────────────────
  getOffers: () => api.get('/admin/offers'),
  getActiveOffers: () => api.get('/admin/offers/active'),
  createOffer: (data: any) => api.post('/admin/offers', data),
  updateOffer: (id: string, data: any) => api.put(`/admin/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/admin/offers/${id}`),

  getBanners: () => api.get('/admin/banners'),
  createBanner: (data: any) => api.post('/admin/banners', data),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),

  // ─── LIVE TRACKING ──────────────────────────────────────────────────
  getDeliveryLocations: () => api.get('/admin/delivery-locations'),

  // ─── DISPUTES & REFUNDS ─────────────────────────────────────────────
  getDisputes: () => api.get('/admin/disputes'),
  updateRefundStatus: (orderId: string, data: { refundStatus?: string, disputeNotes?: string }) => 
    api.post(`/admin/orders/${orderId}/refund`, data),

  // ─── BROADCAST NOTIFICATIONS ────────────────────────────────────────
  getBroadcastNotifications: () => api.get('/admin/notifications'),
  sendBroadcastNotification: (data: { title: string, message: string, targetAudience: string }) => 
    api.post('/admin/notifications', data),

  // ─── COUPONS ──────────────────────────────────────────────────
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  updateCoupon: (id: string, data: any) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),

  // ─── ANALYTICS ────────────────────────────────────────────────
  getAnalytics: () => api.get('/admin/dashboard'),
  getOrdersData: (params?: any) => api.get('/admin/orders', { params }),

  // ─── APP CONFIG & PAYOUTS ─────────────────────────────────────
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data: any) => api.put('/admin/config', data),

  getPayouts: (status?: string, role?: string) => {
    let url = '/admin/payouts';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get(url);
  },
  markPayoutPaid: (payoutId: string, transactionRef: string, notes?: string) => 
    api.post('/admin/payouts/mark-paid', { payoutId, transactionRef, notes }),

  // ─── SUB-ADMINS ────────────────────────────────────────────────
  getSubAdmins: () => api.get('/admin/admins'),
  createSubAdmin: (data: any) => api.post('/admin/admins', data),
  updateSubAdmin: (id: string, data: any) => api.put(`/admin/admins/${id}`, data),
  deleteSubAdmin: (id: string) => api.delete(`/admin/admins/${id}`),
};


// Auth API endpoints
export const authAPI = {
  // Customer registration
  registerCustomer: (data: any) => api.post('/auth/register', data),
  
  // Customer login
  loginCustomer: (data: any) => api.post('/auth/login', data),
  
  // Vendor registration
  registerVendor: (data: any) => api.post('/auth/vendor/register', data),
  
  // Vendor login
  loginVendor: (data: any) => api.post('/auth/vendor/login', data),
  
  // Delivery person registration
  registerDelivery: (data: any) => api.post('/auth/delivery/register', data),
  
  // Delivery person login
  loginDelivery: (data: any) => api.post('/auth/delivery/login', data),
};

// Restaurant API endpoints
export const restaurantAPI = {
  // Get all restaurants
  getAll: (params?: any) => api.get('/restaurants', { params }),
  
  // Get restaurant by ID
  getById: (id: string) => api.get(`/restaurants/${id}`),
  
  // Get nearby restaurants
  getNearby: (params: { latitude: number; longitude: number; radius?: number }) =>
    api.get('/restaurants/nearby', { params }),
};

// Order API endpoints
export const orderAPI = {
  // Create new order
  create: (data: any) => api.post('/orders', data),
  
  // Get orders
  getAll: (params?: any) => api.get('/orders', { params }),
  
  // Get order by ID
  getById: (id: string) => api.get(`/orders/${id}`),
  
  // Update order status
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Customer API endpoints
export const customerAPI = {
  // Get customer profile
  getProfile: () => api.get('/customers/profile'),
  
  // Update customer profile
  updateProfile: (data: any) => api.patch('/customers/profile', data),
  
  // Get customer orders
  getOrders: () => api.get('/customers/orders'),
};

// Vendor API endpoints
export const vendorAPI = {
  // Get vendor profile
  getProfile: () => api.get('/vendor/profile'),
  
  // Update vendor profile
  updateProfile: (data: any) => api.patch('/vendor/profile', data),
  
  // Get vendor orders
  getOrders: () => api.get('/vendor/orders'),
  
  // Update order status
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch(`/vendor/orders/${orderId}/status`, { status }),
};

// Delivery API endpoints
export const deliveryAPI = {
  // Get delivery person profile
  getProfile: () => api.get('/delivery/profile'),
  
  // Update delivery person profile
  updateProfile: (data: any) => api.patch('/delivery/profile', data),
  
  // Get assigned orders
  getAssignedOrders: () => api.get('/delivery/orders'),
  
  // Update order status
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch(`/delivery/orders/${orderId}/status`, { status }),
};

export default api;