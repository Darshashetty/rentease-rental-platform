const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    // Create users one by one to trigger password hashing middleware
    const createdUsers = [];
    createdUsers.push(await User.create({
      name: 'Admin User',
      email: 'admin@rentease.com',
      password: 'admin123',
      role: 'admin'
    }));
    console.log('✅ Admin user created: admin@rentease.com / admin123');

    createdUsers.push(await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    }));
    console.log('✅ Test user created: john@example.com / password123');

    const products = [
      // FURNITURE (8)
      {
        name: 'Premium Queen Size Bed',
        category: 'Furniture',
        subCategory: 'Beds',
        monthlyRent: 1499,
        securityDeposit: 3000,
        rentalTenureOptions: [3, 6, 12],
        stock: 12,
        availability: true,
        image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=2022&auto=format&fit=crop',
        description: 'A solid teak wood queen size bed with an ergonomic orthopedic mattress. Perfect for a restful sleep.'
      },
      {
        name: 'Single Wooden Bed',
        category: 'Furniture',
        subCategory: 'Beds',
        monthlyRent: 899,
        securityDeposit: 1500,
        rentalTenureOptions: [3, 6, 12],
        stock: 20,
        availability: true,
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop',
        description: 'Compact single bed, perfect for bachelors and students. Mattress included.'
      },
      {
        name: 'Modern L-Shaped Sofa',
        category: 'Furniture',
        subCategory: 'Sofas',
        monthlyRent: 2499,
        securityDeposit: 5000,
        rentalTenureOptions: [3, 6, 12],
        stock: 5,
        availability: true,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop',
        description: 'Spacious and plush L-shaped sofa in charcoal grey, ideal for spacious living rooms.'
      },
      {
        name: '3-Seater Leatherette Sofa',
        category: 'Furniture',
        subCategory: 'Sofas',
        monthlyRent: 1799,
        securityDeposit: 4000,
        rentalTenureOptions: [3, 6, 12],
        stock: 8,
        availability: true,
        image: 'https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=2070&auto=format&fit=crop',
        description: 'Elegant 3-seater sofa with premium faux leather finish. Easy to clean and highly durable.'
      },
      {
        name: 'Ergonomic Office Chair',
        category: 'Furniture',
        subCategory: 'Chairs',
        monthlyRent: 599,
        securityDeposit: 1200,
        rentalTenureOptions: [3, 6, 12],
        stock: 25,
        availability: true,
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2070&auto=format&fit=crop',
        description: 'Comfortable mesh office chair with lumbar support and adjustable armrests for long working hours.'
      },
      {
        name: 'Solid Wood Dining Table (4 Seater)',
        category: 'Furniture',
        subCategory: 'Tables',
        monthlyRent: 1299,
        securityDeposit: 3000,
        rentalTenureOptions: [3, 6, 12],
        stock: 10,
        availability: true,
        image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=2070&auto=format&fit=crop',
        description: 'Classic 4-seater dining set made of solid Sheesham wood. Perfect for small families.'
      },
      {
        name: 'Minimalist Study Table',
        category: 'Furniture',
        subCategory: 'Tables',
        monthlyRent: 699,
        securityDeposit: 1500,
        rentalTenureOptions: [3, 6, 12],
        stock: 15,
        availability: true,
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2070&auto=format&fit=crop',
        description: 'Sleek wooden study table with built-in drawers. Ideal for home setups.'
      },
      {
        name: 'Wooden Wardrobe (2-Door)',
        category: 'Furniture',
        subCategory: 'Wardrobes',
        monthlyRent: 999,
        securityDeposit: 2000,
        rentalTenureOptions: [3, 6, 12],
        stock: 8,
        availability: false,
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1974&auto=format&fit=crop',
        description: 'Spacious 2-door wardrobe with a mirror and locker compartment.'
      },

      // APPLIANCES (8)
      {
        name: 'Samsung 253L Double Door Refrigerator',
        category: 'Appliances',
        subCategory: 'Refrigerators',
        monthlyRent: 1499,
        securityDeposit: 3500,
        rentalTenureOptions: [3, 6, 12],
        stock: 8,
        availability: true,
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2026&auto=format&fit=crop',
        description: 'Frost-free double door refrigerator with smart inverter technology. Highly energy-efficient.'
      },
      {
        name: 'Whirlpool 190L Single Door Fridge',
        category: 'Appliances',
        subCategory: 'Refrigerators',
        monthlyRent: 999,
        securityDeposit: 2000,
        rentalTenureOptions: [3, 6, 12],
        stock: 12,
        availability: true,
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=1974&auto=format&fit=crop',
        description: 'Compact and efficient single door refrigerator. Great for bachelors and small families.'
      },
      {
        name: 'LG 7kg Fully Auto Top Load Washing Machine',
        category: 'Appliances',
        subCategory: 'Washing Machines',
        monthlyRent: 1199,
        securityDeposit: 2500,
        rentalTenureOptions: [3, 6, 12],
        stock: 10,
        availability: true,
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=2071&auto=format&fit=crop',
        description: 'Top-loading washing machine with smart motion technology and turbo drum.'
      },
      {
        name: 'IFB 6.5kg Front Load Washing Machine',
        category: 'Appliances',
        subCategory: 'Washing Machines',
        monthlyRent: 1599,
        securityDeposit: 3500,
        rentalTenureOptions: [3, 6, 12],
        stock: 5,
        availability: true,
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2039&auto=format&fit=crop',
        description: 'Premium front-loading washing machine with in-built heater and aqua energie feature.'
      },
      {
        name: 'Sony 43" 4K Smart LED TV',
        category: 'Appliances',
        subCategory: 'TVs',
        monthlyRent: 1899,
        securityDeposit: 4000,
        rentalTenureOptions: [3, 6, 12],
        stock: 7,
        availability: true,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop',
        description: 'Ultra HD 4K Smart TV with Dolby Audio and built-in streaming apps like Netflix and Prime.'
      },
      {
        name: 'OnePlus 32" Y-Series Smart TV',
        category: 'Appliances',
        subCategory: 'TVs',
        monthlyRent: 999,
        securityDeposit: 2000,
        rentalTenureOptions: [3, 6, 12],
        stock: 15,
        availability: true,
        image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2028&auto=format&fit=crop',
        description: 'HD Ready Smart Android TV with bezel-less design and rich color engine.'
      },
      {
        name: 'Panasonic 20L Solo Microwave Oven',
        category: 'Appliances',
        subCategory: 'Microwaves',
        monthlyRent: 599,
        securityDeposit: 1200,
        rentalTenureOptions: [3, 6, 12],
        stock: 20,
        availability: true,
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=2076&auto=format&fit=crop',
        description: 'Compact 20L microwave oven perfect for reheating, defrosting, and basic cooking.'
      },
      {
        name: 'Voltas 1.5 Ton Split AC',
        category: 'Appliances',
        subCategory: 'Air Conditioners',
        monthlyRent: 2199,
        securityDeposit: 5000,
        rentalTenureOptions: [3, 6, 12],
        stock: 4,
        availability: true,
        image: 'https://images.unsplash.com/photo-1626210459587-5421c97a89e0?q=80&w=2070&auto=format&fit=crop',
        description: 'High-performance 1.5 Ton Split AC with fast cooling and energy-saving modes.'
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ Data Imported Successfully!`);
    console.log(`\n📊 Import Summary:`);
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${products.length} products created`);
    console.log(`\n🔑 Admin Credentials:`);
    console.log(`   Email: admin@rentease.com`);
    console.log(`   Password: admin123`);
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
