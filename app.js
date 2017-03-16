var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3100;

users = [];
players = [];
deck = [];

connections = [];
var roomNum = 1;
var roomSize = 8

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var showLog = function () {
    console.log('Connected %s socket(s), %s connected', connections.length, users.length, roomNum);

};

var log = function (msg) {
    console.log (msg);
};

io.sockets.on('connection', function (socket) {
    connections.push(socket.id);

log('connection started: ' + socket.id);

    // console.log(socket.adapter.rooms["room-" + roomNum]);


    //  if (socket.adapter.rooms && socket.adapter.rooms["room-" + roomNum] && socket.adapter.rooms["room-" + roomNum].length > 2)
    //      roomNum++;

    // socket.join("room-" + roomNum);

    showLog();

    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1)
        io.sockets.emit('UPDATE_USERS', { onlineUsers: users });

        showLog();
    });

    //send message
    socket.on('SEND_MESSAGE', function (data) {
        io.sockets.emit('NEW_MESSAGE', { msg: data });
        showLog();
    })

    socket.on('PLAYER_JOINED', function (data) {
        log('player joined call');
        players.push(data);
        io.sockets.emit('UPDATE_USERS', { players: players });
    })

    socket.on('NEW_CONNECTION', function (data) {
        users.push(data);

        io.sockets.emit('NEW_CONNECTION', { user: data });

        setTimeout(function () {
            io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
        }, 4000);

        //io.sockets.emit('UPDATE_USERS', {onlineUsers: users});
        showLog();
    })
    socket.on("TAKE_CARD", function (data) {
        var card = deck[0];
        deck.splic(0, 1);

        io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
    })

});

