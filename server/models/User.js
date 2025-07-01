// In-memory User helper
const { v4: uuidv4 } = require('uuid');

function getUsers(app) {
  return app.locals.users;
}

function findUserById(app, id) {
  return app.locals.users.find(u => u.id === id);
}

function findUserByEmail(app, email) {
  return app.locals.users.find(u => u.email === email);
}

function addUser(app, user) {
  user.id = uuidv4();
  user.createdAt = new Date();
  user.updatedAt = new Date();
  app.locals.users.push(user);
  return user;
}

function updateUser(app, id, updates) {
  const user = findUserById(app, id);
  if (user) {
    Object.assign(user, updates);
    user.updatedAt = new Date();
  }
  return user;
}

function deleteUser(app, id) {
  const idx = app.locals.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    app.locals.users.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = {
  getUsers,
  findUserById,
  findUserByEmail,
  addUser,
  updateUser,
  deleteUser
}; 