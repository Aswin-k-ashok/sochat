const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList= document.getElementById('users')
const socket = io()

// GET USER NAME AND ROOM FROM PARMS
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

//JOIN ROOM
socket.emit('joinRoom', { username, room })

// GET ROOM AND USERS
socket.on('roomUsers',({room,users})=>{
  outputRoomName(room)
  outputUsers(users)
})

socket.on('message', (message) => {
  // message from event emiter in server.js
  console.log(message)
  outputMessage(message)

  //SCROLL DOWN
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//MESSAGE SUBMIT
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // GET MESSAGE TEXT
  const msg = e.target.elements.msg.value

  // EMIT MESSAGE TO SERVER
  socket.emit('chatMessage', msg)

  //CLEAR INPUT
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

//OUTPUT MESSAGE TO DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p> <p class-"text> ${message.text} </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// add room name to dom
function outputRoomName(room){
  roomName.innerText = room;

}

// add users to dom
function outputUsers(users){
  userList.innerHTML= `${users.map(user=>`<li>${user.username}</li>`).join('')}`
}
