# Quick Setup Guide

## 1. Install Dependencies

```bash
# Install all dependencies
npm run install-all
```

## 2. Set up Environment Variables

Create a `.env` file in the `server` directory with the following content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/help-desk
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

## 3. Start MongoDB

Make sure MongoDB is running on your system.

## 4. Seed the Database

```bash
cd server
npm run seed
```

## 5. Start the Application

```bash
# From the root directory
npm run dev
```

## 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@helpdesk.com | password123 |
| Help Desk | agent@helpdesk.com | password123 |
| Gas Station | station@helpdesk.com | password123 |

## Features Available

✅ User Authentication & Authorization  
✅ Ticket Creation & Management  
✅ Real-time Notifications  
✅ File Upload System  
✅ Advanced Filtering & Search  
✅ Dashboard with Statistics  
✅ User Management (Admin)  
✅ Responsive Design  
✅ Role-based Access Control  
✅ Comment System  
✅ Status Tracking  

## Next Steps

1. Explore the dashboard as different user roles
2. Create test tickets
3. Test the notification system
4. Try file uploads
5. Test real-time updates

The application is now ready for use! 🚀 