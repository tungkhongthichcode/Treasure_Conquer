const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname+ "/public")));

const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server);

app.get('/', function(req, res) {
   //res.sendFile(__dirname +"/index.html");
});

const playerJoin = function(id, username, room) {
    const player = {id, username, room};
    players.push(player);
    for (let i = 0; i < leavePlayers.length; i++){
        if (leavePlayers[i].username == player.username){
            leavePlayers.splice(i, 1);
        }
    }
    return player;
};

const playerLeave = function(id, room) {
    let player;
    const index = players.findIndex(player => player.id === id);
    if (index !== -1) {
         player =  players.splice(index, 1)[0];
    }
    leavePlayers.push(player);
    return player;
} 

const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}
    
let players = [];
let leavePlayers = [];
players.map(player => player.colorID = -1);
io.on("connection", function(socket) {
    socket.on("joinRoom", function(username, roomID) {
        const player = playerJoin(socket.id, username, roomID);
        socket.join(player.room);
        io.emit("allUsers", players, leavePlayers);
        io.to(player.room).emit("updateUsers", getRoomUsers(player.room));
        io.to(roomID).emit("updateColors");
    });

    socket.on("leaveRoom", function(leaveIndex, roomID){
        const player = playerLeave(socket.id);
        socket.leave(player.room);
        io.emit("allUsers", players, leavePlayers);
        io.to(player.room).emit("updateUsers", getRoomUsers(player.room));
    });
    
    socket.on("allUsers", function() {
        socket.emit("allUsers", players, leavePlayers);
    });

    socket.on("customize", function(roomID, value, index) {
        io.to(roomID).emit("customize", value, index);
    });

    socket.on("selected", function(roomID, index) {
        let player = getCurrentPlayer(socket.id);
        player.colorID = index;
        io.emit("allUsers", players, leavePlayers);
        io.to(roomID).emit("updateColors");
    });

    socket.on("startGame", function(roomID) {
        io.to(roomID).emit("startGame");
    });
})
server.listen(5500, function() {
    console.log("listen 5500");
});
