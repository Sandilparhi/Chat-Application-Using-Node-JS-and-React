const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const socketio = require('socket.io');
const Cryptr = require("cryptr");
// const bcrypt = require("bcrypt");
const formatMessage = require('./utils/messages');
const cryptr = new Cryptr(
  "mySecretKey"
);
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getMessageStatus,
  getMessages
} = require('./utils/user');
const Messages = require('./api/models/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Configure Database
require('./database/db').connect();

const Register = require('./api/models/registraton');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Sandil';

// Run when client connects
io.on('connection', socket => {
  console.log('A user connected')
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    let dbUser = new Register({
        username: username,
        room: room
    });

    let dbUser1 = dbUser.save()
 
  console.log(dbUser1)

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName,(`Welcome to ${room} chat room!`)));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName,  (`${user.username} has joined the chat`))
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    const status = getMessageStatus(socket.id);
    const dbMsg = getMessages(msg, user.username, user.room)
    io.to(user.room).emit('message', formatMessage(user.username, msg), status);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected')
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

app.get('/dbMessage', async (req, res) => {
  io.on('connection', socket => {
    socket.on('joinRoom', async ({  room }) => {
      Messages.find({room}).then(chat => {
          res.json(chat);
      });          
    });
  });
});


// ROUTES
// app.get("/decrypt", async (req, res) => {
//   message = req.query.message;
//   console.log("LD: " + message.length);
//   decrypted = cryptr.decrypt(message);
//   await res.json(decrypted);
// });

// app.get("/encrypt", async (req, res) => {
//   message = req.query.message;
//   encrypted = cryptr.encrypt(message);
//   console.log("LE: " + encrypted.length);
//   await res.json(encrypted);
// });

 const PORT = process.env.PORT || 2595;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));