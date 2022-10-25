const express = require('express');
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')

const app = express();
const server = http.createServer(app); // transfering the express app to the server
const io = socketio(server)  // transfering the server functionality to the socket io . this is basically an event emitter

// static folder
app.use(express.static(path.join(__dirname,'public')))  // setting up the static files AKA frontend

//admin variable
const admin = 'sochat admin'

// run when client connet

io.on("connection", socket => {

    // WELCOME CURRENT USER
    socket.emit('message', formatMessage(admin,"welcome to sochat"))  // a new event is emited from this event emiter and , this event will be catched in public > js > main.js
    
    //BOADCAST MESSAGE WHEN A USER CONNECTS
    socket.broadcast.emit('message',formatMessage(admin, 'a user has joined the chat'));

    // RUNS WHEN CLIENT DISCONNECTS
    socket.on('disconnect', () => {
        io.emit('message',formatMessage(admin,'a user has left the chat'));
    })

    // LISTEN FOR CHAT MESSAGE
    socket.on('chatMessage', (msg) => {
        io.emit("message",formatMessage('user', msg))
    })
})


const PORT = 8080 || process.env.port

server.listen(PORT,()=> console.log("server running on",PORT));
