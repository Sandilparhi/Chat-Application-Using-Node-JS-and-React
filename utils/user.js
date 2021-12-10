const MessageModel = require('../api/models/messages')
const users = [];
const moment = require('moment')

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];

  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

//status
function getMessageStatus (id){
  const index = users.length
  let status='';
  if(index === 1){
    return status = 'sent'
  } else if(index > 1){
    
    return status = 'delivered'
  }
}

function getMessages(msg, user, room){
  let message = new MessageModel({
    room : room,
    sender: user,
    message: msg,
    time : moment().format('hh:mm a'),
    date : moment().format('DD-MM-YYYY')
})
m = message.save();
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getMessageStatus,
  getMessages
};