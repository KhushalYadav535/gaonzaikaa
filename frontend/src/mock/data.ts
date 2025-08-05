// Mock Users
export const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' as 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'staff' as 'staff' },
];

// Mock Restaurants
export const restaurants = [
  { id: 1, name: 'Spicy Bites', address: '123 Main St', cuisine: 'Indian', image: '', menu: [{ name: 'Paneer Tikka', price: 200 }] },
  { id: 2, name: 'Pasta Palace', address: '456 Elm St', cuisine: 'Italian', image: '', menu: [{ name: 'Spaghetti', price: 150 }] },
];

// Mock Orders
export const orders = [
  { id: 1, customer: 'Alice', restaurant: 'Spicy Bites', status: 'pending' as 'pending', contact: 'alice@example.com', items: [{ name: 'Paneer Tikka', qty: 2, price: 200 }], assignedStaffId: 1, statusTimeline: ['placed'] },
  { id: 2, customer: 'Bob', restaurant: 'Pasta Palace', status: 'preparing' as 'preparing', contact: 'bob@example.com', items: [{ name: 'Spaghetti', qty: 1, price: 150 }], assignedStaffId: 2, statusTimeline: ['placed', 'accepted', 'preparing'] },
];

// Mock Delivery Staff
export const deliveryStaff = [
  { id: 1, name: 'Ramesh Kumar', phone: '9876543210', villages: ['Rampur', 'Lakhanpur'], status: 'active' },
  { id: 2, name: 'Suresh Singh', phone: '9123456780', villages: ['Basantpur'], status: 'on_delivery' },
  { id: 3, name: 'Amit Yadav', phone: '9988776655', villages: ['Rajpur'], status: 'on_leave' },
];

// Mock Restaurant Applications
export const restaurantApplications = [
  { id: 101, name: 'Green Village Cafe', owner: 'Sunita Devi', phone: '9876543211', address: 'Main Road, Rampur', cuisine: 'South Indian', status: 'pending' },
  { id: 102, name: 'Desi Dhaba', owner: 'Mahesh Singh', phone: '9123456789', address: 'Near Bus Stand, Basantpur', cuisine: 'Punjabi', status: 'pending' },
];

// Mock Coupons
export const coupons = [
  { id: 1, code: 'GAON10', discount: 10, validFrom: '2024-06-01', validTo: '2024-06-30', usageLimit: 100, used: 12, applicableVillages: ['Rampur', 'Lakhanpur'], applicableRestaurants: ['Spicy Bites'], status: 'active' },
  { id: 2, code: 'FESTIVE20', discount: 20, validFrom: '2024-06-10', validTo: '2024-06-20', usageLimit: 50, used: 5, applicableVillages: ['Basantpur'], applicableRestaurants: ['Pasta Palace'], status: 'inactive' },
];

// Mock Support Tickets
export const supportTickets = [
  { id: 1, customer: 'Alice', type: 'Complaint', message: 'Order was late.', status: 'open', createdAt: '2024-06-10', response: '' },
  { id: 2, customer: 'Bob', type: 'Feedback', message: 'Loved the food!', status: 'closed', createdAt: '2024-06-09', response: 'Thank you for your feedback!' },
  { id: 3, customer: 'Priya', type: 'Complaint', message: 'Wrong item delivered.', status: 'open', createdAt: '2024-06-11', response: '' },
];

// Mock Notifications
export const notifications = [
  { id: 1, message: 'Special offer for Rampur!', target: 'village', targetValue: 'Rampur', scheduledAt: '2024-06-15T10:00', status: 'scheduled' },
  { id: 2, message: 'Happy Holi! Enjoy 20% off.', target: 'all', targetValue: '', scheduledAt: '2024-06-10T09:00', status: 'sent' },
  { id: 3, message: 'Pasta Palace is now open in Basantpur!', target: 'restaurant', targetValue: 'Pasta Palace', scheduledAt: '2024-06-12T12:00', status: 'sent' },
];

// Mock Villages
export const villages = [
  { id: 1, name: 'Rampur', deliveryZone: 'Zone 1', assignedRestaurants: ['Spicy Bites', 'Green Village Cafe'], orderVolume: 120 },
  { id: 2, name: 'Lakhanpur', deliveryZone: 'Zone 2', assignedRestaurants: ['Desi Dhaba'], orderVolume: 90 },
  { id: 3, name: 'Basantpur', deliveryZone: 'Zone 1', assignedRestaurants: ['Pasta Palace'], orderVolume: 60 },
  { id: 4, name: 'Rajpur', deliveryZone: 'Zone 3', assignedRestaurants: [], orderVolume: 40 },
];

// Mock Admin Users
export const adminUsers = [
  { id: 1, name: 'Admin', email: 'admin@gaon.com', role: 'super_admin' },
  { id: 2, name: 'Support', email: 'support@gaon.com', role: 'support' },
  { id: 3, name: 'RManager', email: 'manager@gaon.com', role: 'restaurant_manager' },
  { id: 4, name: 'DManager', email: 'delivery@gaon.com', role: 'delivery_manager' },
]; 