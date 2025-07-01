// In-memory Ticket helper
const { v4: uuidv4 } = require('uuid');

function getTickets(app) {
  return app.locals.tickets;
}

function findTicketById(app, id) {
  return app.locals.tickets.find(t => t.id === id);
}

function addTicket(app, ticket) {
  ticket.id = uuidv4();
  ticket.comments = [];
  ticket.attachments = ticket.attachments || [];
  ticket.createdAt = new Date();
  ticket.updatedAt = new Date();
  app.locals.tickets.push(ticket);
  return ticket;
}

function updateTicket(app, id, updates) {
  const ticket = findTicketById(app, id);
  if (ticket) {
    Object.assign(ticket, updates);
    ticket.updatedAt = new Date();
  }
  return ticket;
}

function deleteTicket(app, id) {
  const idx = app.locals.tickets.findIndex(t => t.id === id);
  if (idx !== -1) {
    app.locals.tickets.splice(idx, 1);
    return true;
  }
  return false;
}

function addComment(app, ticketId, comment) {
  const ticket = findTicketById(app, ticketId);
  if (ticket) {
    comment.id = uuidv4();
    comment.createdAt = new Date();
    ticket.comments.push(comment);
    ticket.updatedAt = new Date();
    return comment;
  }
  return null;
}

module.exports = {
  getTickets,
  findTicketById,
  addTicket,
  updateTicket,
  deleteTicket,
  addComment
}; 