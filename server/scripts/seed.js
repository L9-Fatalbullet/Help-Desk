const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
require('dotenv').config();

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
    priority: 'critical',
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
    status: 'resolved'
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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/help-desk');
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
        reportedBy: reportedBy._id,
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

// Run the seed function
seedDatabase(); 