# Gas Station Help Desk Management System

A modern web application for IT help-desk teams to manage and resolve technical problems reported by gas stations. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **User Authentication System** with role-based access control (Admin, Help Desk Agent, Gas Station Staff)
- **Ticket Management** with comprehensive CRUD operations
- **Real-time Updates** using Socket.IO for live notifications and status changes
- **File Upload System** for attachments (screenshots, logs, documents)
- **Advanced Filtering & Search** for tickets and users
- **Notification System** with in-app and email notifications
- **Responsive Design** optimized for desktop and mobile devices

### User Roles & Permissions

#### Admin
- Full system access
- User management (create, edit, delete users)
- View all tickets and statistics
- System configuration

#### Help Desk Agent
- View and manage tickets
- Update ticket status and priority
- Add internal comments
- Assign tickets to other agents
- View dashboard statistics

#### Gas Station Staff
- Create new tickets
- View their own tickets
- Add comments to their tickets
- Upload attachments
- Track ticket status

### Ticket Management
- **Priority Levels**: Low, Medium, High, Critical
- **Status Tracking**: Open, In Progress, Resolved, Closed
- **Categories**: Hardware, Software, Network, Payment, Fuel System, Other
- **File Attachments**: Support for images, PDFs, documents, logs (up to 10MB each)
- **Comments System**: Public and internal comments
- **Assignment**: Tickets can be assigned to specific help desk agents

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **nodemailer** - Email notifications
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gas-station-help-desk
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/help-desk

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

### 5. Create Initial Admin User

The application will automatically create demo users on first run, but you can also create them manually using the API:

```bash
# Create admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "admin",
    "email": "admin@helpdesk.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### 6. Start the Application

#### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend client (port 3000) concurrently.

#### Production Mode
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👥 Demo Users

The application includes demo users for testing:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@helpdesk.com | password123 | Full system access |
| Help Desk | agent@helpdesk.com | password123 | Ticket management |
| Gas Station | station@helpdesk.com | password123 | Create/view own tickets |

## 📁 Project Structure

```
gas-station-help-desk/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   ├── index.js           # Server entry point
│   └── package.json       # Server dependencies
├── client/                # Frontend application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Client dependencies
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/change-password` - Change password

### Tickets
- `GET /api/tickets` - Get tickets with filters
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get single ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment
- `GET /api/tickets/stats/overview` - Get ticket statistics

### Users
- `GET /api/users` - Get users (admin/help-desk only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/stats/overview` - Get user statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔒 Security Features

- **JWT Authentication** with token expiration
- **Password Hashing** using bcrypt
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Role-based Access Control** (RBAC)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku account and install Heroku CLI
2. Create a new Heroku app
3. Add MongoDB add-on (MongoDB Atlas)
4. Set environment variables in Heroku dashboard
5. Deploy using Git

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Updates & Maintenance

- Regularly update dependencies for security patches
- Monitor MongoDB performance and optimize queries
- Backup database regularly
- Monitor application logs for errors
- Update JWT secrets periodically

## 📊 Performance Optimization

- Implement database indexing for frequently queried fields
- Use Redis for caching (optional)
- Optimize image uploads with compression
- Implement pagination for large datasets
- Use CDN for static assets in production

---

**Built with ❤️ for efficient IT help desk management** 