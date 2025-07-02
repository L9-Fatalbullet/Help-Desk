require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

const demoUsers = [
  {
    username: 'admin',
    email: 'admin@helpdesk.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+1-555-0100',
    isActive: true
  },
  {
    username: 'agent1',
    email: 'agent@helpdesk.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Agent',
    role: 'help-desk',
    phone: '+1-555-0101',
    isActive: true
  },
  {
    username: 'agent2',
    email: 'agent2@helpdesk.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Technician',
    role: 'help-desk',
    phone: '+1-555-0102',
    isActive: true
  },
  {
    username: 'station1',
    email: 'station@helpdesk.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Manager',
    role: 'gas-station',
    gasStationLocation: 'Downtown Station',
    phone: '+1-555-0200',
    isActive: true
  },
  {
    username: 'station2',
    email: 'station2@helpdesk.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Operator',
    role: 'gas-station',
    gasStationLocation: 'Highway Station',
    phone: '+1-555-0201',
    isActive: true
  }
];

const sampleTickets = [
  {
    title: 'Fuel Pump Not Responding',
    description: 'Pump #3 is not responding to customer card swipes. The display shows "System Error" and the pump is completely unresponsive.',
    priority: 'high',
    category: 'hardware',
    gasStationLocation: 'Downtown Station',
    status: 'open'
  },
  {
    title: 'Payment System Down',
    description: 'All payment terminals are showing "Connection Error". Customers cannot complete transactions.',
    priority: 'high',
    category: 'payment',
    gasStationLocation: 'Highway Station',
    status: 'in-progress'
  },
  {
    title: 'Network Connectivity Issues',
    description: 'Intermittent network connectivity affecting POS system and fuel monitoring.',
    priority: 'medium',
    category: 'network',
    gasStationLocation: 'Downtown Station',
    status: 'closed'
  },
  {
    title: 'Software Update Required',
    description: 'POS system needs software update to comply with new payment regulations.',
    priority: 'medium',
    category: 'software',
    gasStationLocation: 'Highway Station',
    status: 'open'
  },
  {
    title: 'Fuel Tank Monitoring System',
    description: 'Fuel tank level sensors are not reporting accurate readings.',
    priority: 'low',
    category: 'fuel-system',
    gasStationLocation: 'Downtown Station',
    status: 'closed'
  }
];

const users = [
  {
    username: 'admin',
    email: 'admin@gasstation.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true
  },
  {
    username: 'agent',
    email: 'agent@gasstation.com',
    password: 'agent123',
    firstName: 'Help',
    lastName: 'Desk',
    role: 'help-desk',
    isActive: true
  },
  {
    username: 'staff',
    email: 'staff@gasstation.com',
    password: 'staff123',
    firstName: 'Gas',
    lastName: 'Station',
    role: 'gas-station',
    gasStationLocation: 'Station 1',
    isActive: true
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
  await mongoose.disconnect();
  console.log('Seeding complete.');
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/help-desk');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create sample tickets
    const gasStationUsers = createdUsers.filter(user => user.role === 'gas-station');
    const helpDeskUsers = createdUsers.filter(user => user.role === 'help-desk');

    for (let i = 0; i < sampleTickets.length; i++) {
      const ticketData = sampleTickets[i];
      const reportedBy = gasStationUsers[i % gasStationUsers.length];
      const assignedTo = i < 2 ? helpDeskUsers[i % helpDeskUsers.length] : null;

      const ticket = new Ticket({
        ...ticketData,
        createdBy: reportedBy._id,
        assignedTo: assignedTo?._id
      });

      await ticket.save();
      console.log(`Created ticket: ${ticket.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Users:');
    demoUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Password: ${user.password}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Utility: List all users in the database
async function listUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/help-desk');
  const users = await User.find({});
  console.log('\nCurrent users in the database:');
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Username: ${u.username}, Role: ${u.role}`);
  });
  await mongoose.disconnect();
}

// Uncomment to list users
// listUsers();

// Run the seed function
// seed();
seedDatabase();

// Utility: Reset admin password
async function resetAdminPassword() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/help-desk');
  const result = await User.findOneAndUpdate(
    { email: 'admin@helpdesk.com' },
    { password: 'password123' },
    { new: true }
  );
  if (result) {
    console.log('Admin password reset to password123');
  } else {
    console.log('Admin user not found');
  }
  await mongoose.disconnect();
}

// Uncomment to reset admin password
// resetAdminPassword(); 