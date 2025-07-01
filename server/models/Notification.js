// In-memory Notification helper
const { v4: uuidv4 } = require('uuid');

function getNotifications(app) {
  return app.locals.notifications;
}

function findNotificationById(app, id) {
  return app.locals.notifications.find(n => n.id === id);
}

function addNotification(app, notification) {
  notification.id = uuidv4();
  notification.isRead = false;
  notification.createdAt = new Date();
  notification.updatedAt = new Date();
  app.locals.notifications.push(notification);
  return notification;
}

function updateNotification(app, id, updates) {
  const notification = findNotificationById(app, id);
  if (notification) {
    Object.assign(notification, updates);
    notification.updatedAt = new Date();
  }
  return notification;
}

function deleteNotification(app, id) {
  const idx = app.locals.notifications.findIndex(n => n.id === id);
  if (idx !== -1) {
    app.locals.notifications.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = {
  getNotifications,
  findNotificationById,
  addNotification,
  updateNotification,
  deleteNotification
}; 