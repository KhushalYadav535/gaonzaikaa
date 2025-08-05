# Admin Earnings Calculation Guide

## Overview

The admin earnings system calculates revenue generated for the platform from vendor commissions (10%) and delivery charges (₹8 per order). This document explains how the calculations work and provides examples.

## How Admin Earnings Work

### 1. Revenue Structure

- **Vendor Commission Rate**: Fixed 10% commission on order amount
- **Delivery Charge**: Fixed ₹8 per order
- **Admin Earnings**: Commission + Delivery Charge
- **Restaurant Receives**: Order amount minus commission (delivery charge is separate)

### 2. Calculation Formula

```
Commission Earnings = Order Total Amount × (10 / 100)
Delivery Charge = ₹8 (fixed per order)
Total Admin Earnings = Commission Earnings + Delivery Charge
Restaurant Receives = Order Total Amount - Commission Earnings
```

### 3. Example Calculation

**Scenario**: Order of ₹500

```
Order Amount: ₹500
Commission Rate: 10%
Commission Earnings: ₹500 × (10/100) = ₹50
Delivery Charge: ₹8
Total Admin Earnings: ₹50 + ₹8 = ₹58
Restaurant Receives: ₹500 - ₹50 = ₹450
```

## Implementation Details

### Backend Calculation (routes/admin.js)

#### Dashboard Endpoint (`/admin/dashboard`)

```javascript
// Calculate total admin earnings from vendor commissions
const totalAdminEarnings = orders.reduce((sum, order) => {
  const vendor = vendors.find(v => 
    v.restaurantId && v.restaurantId.toString() === order.restaurantId.toString()
  );
  if (vendor) {
    const commission = (order.totalAmount * vendor.commission) / 100;
    return sum + commission;
  }
  return sum;
}, 0);
```

#### Detailed Earnings Endpoint (`/admin/earnings`)

```javascript
// Calculate earnings breakdown by restaurant
const earningsBreakdown = orders.reduce((acc, order) => {
  const vendor = vendors.find(v => 
    v.restaurantId && v.restaurantId.toString() === order.restaurantId.toString()
  );
  if (vendor) {
    const commission = (order.totalAmount * vendor.commission) / 100;
    const restaurantName = order.restaurantId?.name || 'Unknown Restaurant';
    
    if (!acc[restaurantName]) {
      acc[restaurantName] = {
        restaurantName,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        commissionRate: vendor.commission
      };
    }
    
    acc[restaurantName].totalOrders += 1;
    acc[restaurantName].totalRevenue += order.totalAmount;
    acc[restaurantName].totalCommission += commission;
  }
  return acc;
}, {});
```

### Vendor Model Configuration

```javascript
// models/Vendor.js
commission: {
  type: Number,
  default: 10, // 10% commission
  min: 0,
  max: 100
}
```

## Time Period Calculations

### Available Periods

1. **All Time**: All orders since platform inception
2. **Today**: Orders from today (00:00:00 to current time)
3. **This Week**: Orders from last 7 days
4. **This Month**: Orders from last 30 days

### Period Filtering Logic

```javascript
let ordersQuery = { isActive: true };

if (period === 'today') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  ordersQuery.createdAt = { $gte: today };
} else if (period === 'week') {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  ordersQuery.createdAt = { $gte: weekAgo };
} else if (period === 'month') {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  ordersQuery.createdAt = { $gte: monthAgo };
}
```

## Frontend Display

### Dashboard Card

- Shows total admin earnings with animated counter
- Displays in Indian Rupees (₹) format
- Clickable card opens detailed breakdown modal

### Detailed Earnings Page

- Period filtering dropdown
- Summary cards with key metrics
- Detailed breakdown table by restaurant
- Professional UI with gradients and proper formatting

## Key Metrics Calculated

### 1. Total Earnings
Sum of all commission amounts from all orders

### 2. Total Revenue
Sum of all order amounts

### 3. Earnings Percentage
```
(Total Admin Earnings / Total Revenue) × 100
```

### 4. Average Commission Rate
```
Sum of all vendor commission rates / Number of vendors
```

### 5. Average Order Value
```
Total Revenue / Total Number of Orders
```

### 6. Average Earnings per Order
```
Total Admin Earnings / Total Number of Orders
```

## API Endpoints

### 1. Dashboard Data
```
GET /admin/dashboard
```
Returns:
- `totalAdminEarnings`: Total earnings from all orders
- `todayAdminEarnings`: Today's earnings
- `thisMonthAdminEarnings`: This month's earnings

### 2. Detailed Earnings
```
GET /admin/earnings?period=all|today|week|month
```
Returns:
- `totalEarnings`: Total earnings for the period
- `totalRevenue`: Total revenue for the period
- `totalOrders`: Total orders for the period
- `earningsBreakdown`: Detailed breakdown by restaurant
- `summary`: Summary statistics

## Testing the Calculation

Run the test script to see actual calculations:

```bash
node test-admin-earnings.js
```

This script will:
1. Connect to your database
2. Calculate all earnings
3. Show detailed breakdown by restaurant
4. Display commission rate distribution
5. Provide example calculations

## Important Notes

1. **Commission Rates**: Can be customized per vendor (default: 10%)
2. **Order Status**: Only active orders are included in calculations
3. **Vendor Matching**: Orders are matched to vendors via restaurantId
4. **Currency**: All amounts are in Indian Rupees (₹)
5. **Rounding**: Commission amounts are calculated with full precision

## Future Enhancements

1. **Delivery Commission**: Add commission from delivery persons
2. **Dynamic Rates**: Allow commission rates to change over time
3. **Payout Tracking**: Track when earnings are paid out to admin
4. **Tax Calculations**: Include tax implications in earnings
5. **Export Features**: Export earnings reports to CSV/PDF

## Troubleshooting

### Common Issues

1. **Zero Earnings**: Check if vendors have commission rates set
2. **Missing Data**: Ensure orders have valid restaurantId references
3. **Date Issues**: Verify order timestamps are correct
4. **Vendor Matching**: Confirm vendor.restaurantId matches order.restaurantId

### Debug Steps

1. Check vendor commission rates in database
2. Verify order data integrity
3. Test with sample data
4. Review calculation logic in code
5. Check API responses for errors 