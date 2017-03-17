var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3200;


players = [];
deck = [];
rooms = [];

connections = [];
var roomNum = 1;
var roomSize = 8

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

var log = function (obj) {
    console.log(JSON.stringify(obj));
};

io.sockets.on('connection', function (socket) {
    connections.push(socket.id);

    log('Connection started ' + socket.id + ', # of connections ' + connections.length);

    // console.log(socket.adapter.rooms["room-" + roomNum]);

    //  if (socket.adapter.rooms && socket.adapter.rooms["room-" + roomNum] && socket.adapter.rooms["room-" + roomNum].length > 2)
    //      roomNum++;

    // socket.join("room-" + roomNum);

    socket.on('disconnect', function (data) {

        var playerLeft;

        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                playerLeft = players[i];
                players.splice(i, 1);
                break;
            }
        }

        log(connections);
        for (var i = 0; i < connections.length; i++) {
            if (connections[i] == socket.id) {
                connections.splice(i, 1);
            }
        }


        io.sockets.emit('PLAYER_LEFT', { player: playerLeft });


        log('Connection lost ' + socket.id + ', # of connections ' + connections.length);

    });

    //send message
    socket.on('SEND_MESSAGE', function (data) {
        io.sockets.emit('NEW_MESSAGE', { msg: data });
    });

    //let create room 
    socket.on('CREATE_ROOM', function (data) {
        players.push(data);
        io.sockets.emit('UPDATE_PLAYERS', { players: players });
    });

    // when player joined to room
    socket.on('PLAYER_JOINED', function (data) {
        log(data);
        data.id = socket.id;
        players.push(data);
        io.sockets.emit('UPDATE_PLAYERS', { players: players, thisPlayer: data });
    });

    // when player hit the exit button
    socket.on('PLAYER_LEFT', function (data) {
        var playerLeft;

        for (var i = 0; i < players.length; i++) {
            if (players[i].id == data.id) {
                playerLeft = players[i];
                players.splice(i, 1);
                break;
            }
        }

        log('Player ' + data.nickname + ' left');
        io.sockets.emit('PLAYER_LEFT', { player: playerLeft });
    });

    socket.on('NEW_CONNECTION', function (data) {
        //users.push(data);

        log('New Connection called');


        io.sockets.emit('NEW_CONNECTION', { user: data });

        setTimeout(function () {
            io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
        }, 4000);

        //io.sockets.emit('UPDATE_USERS', {onlineUsers: users});
        showLog();
    });

    // when player take a card 
    socket.on("TAKE_CARD", function (data) {
        var card = deck[0];
        deck.splice(0, 1);

        io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
    });

});

