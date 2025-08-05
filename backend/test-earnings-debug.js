const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Vendor = require('./models/Vendor');

async function testEarnings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://infoniict3:u3LxBHUbcVwNJhG2@gaonzaika.azbxae5.mongodb.net/');
    console.log('Connected to MongoDB');

    // Get orders
    const orders = await Order.find({ isActive: true }).populate('restaurantId', 'name');
    console.log(`Found ${orders.length} orders`);

    // Get vendors
    const vendors = await Vendor.find({ isActive: true });
    console.log(`Found ${vendors.length} vendors`);

    // Check each order
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  RestaurantId: ${order.restaurantId}`);
      console.log(`  RestaurantId type: ${typeof order.restaurantId}`);
      console.log(`  RestaurantId toString: ${order.restaurantId ? order.restaurantId.toString() : 'null'}`);
      console.log('---');
    });

    // Check each vendor
    vendors.forEach((vendor, index) => {
      console.log(`Vendor ${index + 1}:`);
      console.log(`  ID: ${vendor._id}`);
      console.log(`  RestaurantId: ${vendor.restaurantId}`);
      console.log(`  RestaurantId type: ${typeof vendor.restaurantId}`);
      console.log(`  RestaurantId toString: ${vendor.restaurantId ? vendor.restaurantId.toString() : 'null'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testEarnings(); 