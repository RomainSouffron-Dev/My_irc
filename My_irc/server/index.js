const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

rooms = [];
users = [];
tmp_users = [];
io.on("connection", socket => {

    socket.on('newUser', (username) => {
        users[username] = socket.id;
        socket.on('disconnect', () => {
            io.emit('chat message', { msg: username + " leave", room: "Admin" });
        })
        io.emit('chat message', { msg: username + " is connected", room: "Admin" });

        socket.on("chat message", (msg) => {

            // Parsing du message a l'envoi
            var array_msg = msg.split(' ');
            //Si la premiere lettre contient un "/" on rentre dans les commandes
            if (msg.charAt(0) === "/") {
                if (array_msg[0] === "/nick") {
                    old_username = username;
                    username = array_msg[1];
                    io.emit('chat message', { msg: `${old_username} changed his name to ${username}`, room: "Admin" });
                } else if (array_msg[0] === "/create") {
                    if (rooms.includes(array_msg[1])) {
                        socket.emit('chat message', { msg: array_msg[1] + " already exists you have to /join", room: "Admin" });
                    } else {
                        //creer le channel et met son nom dans un tableau
                        socket.join(array_msg[1]);
                        rooms.push(array_msg[1]);
                        io.emit('chat message', { msg: 'New channel created: ' + array_msg[1], room: "Admin" })
                        io.to(array_msg[1]).emit('chat message', { msg: username + " is connected.", room: array_msg[1] });

                    }
                } else if (array_msg[0] === "/join") {
                    if (rooms.includes(array_msg[1])) {
                        socket.join(array_msg[1]);
                        io.to(array_msg[1]).emit('chat message', { msg: username + " is connected", room: array_msg[1] });
                    } else {
                        socket.emit('chat message', { msg: "Channel doesn't exist you have to create it", room: "Admin" });
                    }

                } else if (array_msg[0] === "/part") {
                    socket.leave(array_msg[1]);
                    io.to(array_msg[1]).emit('chat message', { msg: username + " leave the channel", room: array_msg[1] })
                } else if (array_msg[0] === "/list") {
                    if (rooms.length <= 0) {
                        io.emit('chat message', {
                            msg: "There is no channel right now",
                            room: 'Admin'
                        });
                    } else {
                        io.emit('chat message', {
                            msg: 'This is all channel available:' + rooms.map(e => { return (" " + e); }),
                            room: 'Admin'
                        });
                    }
                }
                else if (array_msg[0] === "/msg") {
                    var input = "";
                    for (let i = 2; i < array_msg.length; i++) {
                        input += " " + array_msg[i];
                    }
                    io.to(users[array_msg[1]]).emit('chat message', {
                        msg: input,
                        room: username
                    });
                }
                else if (array_msg[0] === "/users") {
                    io.of('/').in(array_msg[1]).clients((error, clients) => {
                        if (error) throw error;
                        clients.map(e => {
                            for (var user_name in users) {
                                if (users[user_name] === e) {
                                    tmp_users.push(user_name);
                                }
                            }
                        });
                        io.emit('chat message', {
                            msg: "This is all users connected to this channel: " + tmp_users.map(e => { return " " + e }),
                            room: "Admin"
                        });
                        tmp_users = [];
                    });
                }
                else {
                    let room_name = array_msg[0].substring(1)
                    if (rooms.includes(room_name)) {
                        var clients = socket.rooms;
                        if (room_name in clients) {
                            array_msg.shift();
                            let new_msg = array_msg.join(' ');
                            io.to(room_name).emit('chat message', { msg: username + ": " + new_msg, room: room_name });
                        } else {
                            socket.emit('chat message', { msg: "You're not in this room", room: "Admin" });
                        }
                    } else {
                        socket.emit('chat message', { msg: "Channel doesn't exist", room: "Admin" });
                    }

                }
            } else {
                //Sinon c'est un message global
                io.emit("chat message", { msg: username + ": " + msg, room: "Global" });

            }
        });

    })
});



server.listen(4242, () => {
    console.log('Server is runnin on port 4242')
})