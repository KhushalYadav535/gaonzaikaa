import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will be proxied to the backend during development
  timeout: 10000,
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
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Login
  login: (credentials: { email: string; password: string }) =>
    api.post('/admin/login', credentials),

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
  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string, role: string) =>
    api.delete(`/admin/users/${id}`, { data: { role } }),
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