const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

const app = express()
const server = http.createServer(app) // transfering the express app to the server
const io = socketio(server) // transfering the server functionality to the socket io . this is basically an event emitter

// static folder
app.use(express.static(path.join(__dirname, 'public'))) // setting up the static files AKA frontend

//admin variable
const admin = 'sochat admin'

// run when client connet

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // WELCOME CURRENT USER
    socket.emit('message', formatMessage(admin, 'welcome to sochat')) // a new event is emited from this event emiter and , this event will be catched in public > js > main.js
    console.log(user.username)
    //BOADCAST MESSAGE WHEN A USER CONNECTS
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(admin, `${user.username} has joined the chat`)
      )
    //SEND USERS AND ROOM INFO
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // LISTEN FOR CHAT MESSAGE
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })
  // RUNS WHEN CLIENT DISCONNECTS
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(admin, `${user.username} has left the chat`)
      )
      //SEND USERS AND ROOM INFO
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = 8080 || process.env.port

server.listen(PORT, () => console.log('server running on', PORT))
