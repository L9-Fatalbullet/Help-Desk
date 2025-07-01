const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const { authenticateToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// In-memory storage
app.locals.users = [];
app.locals.tickets = [];
app.locals.notifications = [];

// Demo data (optional, can be removed or replaced)
const { addUser } = require('./models/User');
addUser(app, {
  username: 'admin',
  email: 'admin@gasstation.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true
});
addUser(app, {
  username: 'agent',
  email: 'agent@gasstation.com',
  password: 'agent123',
  firstName: 'Help',
  lastName: 'Desk',
  role: 'help-desk',
  isActive: true
});
addUser(app, {
  username: 'staff',
  email: 'staff@gasstation.com',
  password: 'staff123',
  firstName: 'Gas',
  lastName: 'Station',
  role: 'gas-station',
  gasStationLocation: 'Station 1',
  isActive: true
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// File uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', authenticateToken, ticketRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Socket.io
app.set('io', io);
io.on('connection', (socket) => {
  // Join ticket room for real-time updates
  socket.on('join-ticket', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
  });
  socket.on('leave-ticket', (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
  });
});

// Serve frontend (if built)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 