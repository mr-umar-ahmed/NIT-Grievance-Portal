require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@grievancenit.com',
      phone: '1234567890',
      password: 'admin123',
      role: 'ADMIN',
      department: 'Administration',
      address: 'Main Campus',
      idProofType: 'EmployeeID',
      idProofNumber: 'ADMIN001',
      isApproved: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@grievancenit.com');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdminUser();
