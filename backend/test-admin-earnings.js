const mongoose = require('mongoose');
const Order = require('./models/Order');
const Vendor = require('./models/Vendor');
const Restaurant = require('./models/Restaurant');

// Connect to MongoDB (update with your connection string)
mongoose.connect('mongodb://localhost:27017/gaonzaikaa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function calculateAdminEarnings() {
  try {
    console.log('🔍 Calculating Admin Earnings...\n');

    // Constants for admin earnings calculation
    const VENDOR_COMMISSION_RATE = 10; // 10% commission
    const DELIVERY_CHARGE = 8; // ₹8 per order

    // Get all active orders
    const orders = await Order.find({ isActive: true });
    console.log(`📦 Total Orders: ${orders.length}`);

    // Get all active vendors
    const vendors = await Vendor.find({ isActive: true });
    console.log(`🏪 Total Vendors: ${vendors.length}`);

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    console.log(`💰 Total Revenue: ₹${totalRevenue.toFixed(2)}`);

    // Calculate admin earnings from vendor commissions + delivery charges
    let totalAdminEarnings = 0;
    let totalCommissionEarnings = 0;
    let totalDeliveryCharges = 0;
    const earningsByRestaurant = {};

    orders.forEach(order => {
      const vendor = vendors.find(v => 
        v.restaurantId && v.restaurantId.toString() === order.restaurantId.toString()
      );
      
      if (vendor) {
        const commission = (order.totalAmount * VENDOR_COMMISSION_RATE) / 100;
        const deliveryCharge = DELIVERY_CHARGE;
        const orderEarnings = commission + deliveryCharge;
        
        totalAdminEarnings += orderEarnings;
        totalCommissionEarnings += commission;
        totalDeliveryCharges += deliveryCharge;

        // Group by restaurant for detailed breakdown
        const restaurantId = order.restaurantId.toString();
        if (!earningsByRestaurant[restaurantId]) {
          earningsByRestaurant[restaurantId] = {
            restaurantId,
            totalOrders: 0,
            totalRevenue: 0,
            totalCommission: 0,
            totalDeliveryCharges: 0,
            totalEarnings: 0,
            commissionRate: VENDOR_COMMISSION_RATE,
            deliveryCharge: DELIVERY_CHARGE
          };
        }
        
        earningsByRestaurant[restaurantId].totalOrders += 1;
        earningsByRestaurant[restaurantId].totalRevenue += order.totalAmount;
        earningsByRestaurant[restaurantId].totalCommission += commission;
        earningsByRestaurant[restaurantId].totalDeliveryCharges += deliveryCharge;
        earningsByRestaurant[restaurantId].totalEarnings += orderEarnings;
      }
    });

    console.log(`💵 Total Admin Earnings: ₹${totalAdminEarnings.toFixed(2)}`);
    console.log(`   📈 Commission Earnings: ₹${totalCommissionEarnings.toFixed(2)}`);
    console.log(`   🚚 Delivery Charges: ₹${totalDeliveryCharges.toFixed(2)}`);
    console.log(`📊 Earnings Percentage: ${((totalAdminEarnings / totalRevenue) * 100).toFixed(2)}%`);

    // Show detailed breakdown by restaurant
    console.log('\n📋 Earnings Breakdown by Restaurant:');
    console.log('=' .repeat(80));
    
    const restaurants = await Restaurant.find({ isActive: true });
    
    for (const [restaurantId, data] of Object.entries(earningsByRestaurant)) {
      const restaurant = restaurants.find(r => r._id.toString() === restaurantId);
      const restaurantName = restaurant ? restaurant.name : 'Unknown Restaurant';
      
      console.log(`\n🏪 ${restaurantName}`);
      console.log(`   📦 Orders: ${data.totalOrders}`);
      console.log(`   💰 Revenue: ₹${data.totalRevenue.toFixed(2)}`);
      console.log(`   📈 Commission Rate: ${data.commissionRate}%`);
      console.log(`   💵 Commission Earnings: ₹${data.totalCommission.toFixed(2)}`);
      console.log(`   🚚 Delivery Charges: ₹${data.totalDeliveryCharges.toFixed(2)}`);
      console.log(`   💰 Total Admin Earnings: ₹${data.totalEarnings.toFixed(2)}`);
      console.log(`   📊 Restaurant's Share: ₹${(data.totalRevenue - data.totalCommission).toFixed(2)}`);
    }

    // Show commission rate distribution
    console.log('\n📊 Commission Rate Distribution:');
    console.log('=' .repeat(50));
    
    const commissionRates = {};
    vendors.forEach(vendor => {
      const rate = vendor.commission;
      commissionRates[rate] = (commissionRates[rate] || 0) + 1;
    });

    for (const [rate, count] of Object.entries(commissionRates)) {
      console.log(`${rate}% commission: ${count} vendor(s)`);
    }

    // Calculate average commission rate
    const avgCommissionRate = vendors.length > 0 
      ? vendors.reduce((sum, v) => sum + v.commission, 0) / vendors.length 
      : 0;
    console.log(`\n📈 Average Commission Rate: ${avgCommissionRate.toFixed(1)}%`);

    // Show example calculation
    console.log('\n🧮 Example Calculation:');
    console.log('=' .repeat(50));
    if (orders.length > 0) {
      const exampleOrder = orders[0];
      const exampleVendor = vendors.find(v => 
        v.restaurantId && v.restaurantId.toString() === exampleOrder.restaurantId.toString()
      );
      
      if (exampleVendor) {
        const exampleRestaurant = restaurants.find(r => r._id.toString() === exampleOrder.restaurantId.toString());
        const commission = exampleOrder.totalAmount * (VENDOR_COMMISSION_RATE / 100);
        const deliveryCharge = DELIVERY_CHARGE;
        const totalEarnings = commission + deliveryCharge;
        
        console.log(`Order Amount: ₹${exampleOrder.totalAmount}`);
        console.log(`Commission Rate: ${VENDOR_COMMISSION_RATE}%`);
        console.log(`Commission Earnings: ₹${commission.toFixed(2)}`);
        console.log(`Delivery Charge: ₹${deliveryCharge}`);
        console.log(`Total Admin Earnings: ₹${totalEarnings.toFixed(2)}`);
        console.log(`Restaurant Receives: ₹${(exampleOrder.totalAmount - commission).toFixed(2)}`);
        console.log(`Restaurant: ${exampleRestaurant ? exampleRestaurant.name : 'Unknown'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error calculating admin earnings:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the calculation
calculateAdminEarnings(); 