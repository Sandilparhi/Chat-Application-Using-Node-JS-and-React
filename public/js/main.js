const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message, status) => {
 // myMsg = 'delivered'
 console.log(message );
 //outputMessage(message, status);
 url = "http://localhost:2595/decrypt?message=" + message.text;
 console.log("URL : " + url);
 fetch(url)
   .then((res) => res.json())
   .then((decrypted) => {
     console.log("DECRYPTED ", decrypted);
     outputMessage({
         username: message.username,
       text: decrypted,
       time: message.time,
       date: message.date 
     }, status);
   });

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

//   msg = msg.trim();

//   if (!msg) {
//     return false;
//   }

  url = "http://localhost:2595/encrypt?message=" + msg;
  fetch(url)
    .then((res) => res.json())
    .then((encrypted) => {
  socket.emit('chatMessage', encrypted);
    });

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message, status) {
    if(status === undefined){
        status = ''
    }
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span> &nbsp;&nbsp;`;
  p.innerHTML += `<span>${status}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});