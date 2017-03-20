var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3200;


var players = [];
var deck = [];
var rooms = [];

var cardTyes = [
    { key: 'C', name: 'Club' },
    { key: 'D', name: "Diamond" },
    { key: 'H', name: "Heart" },
    { key: 'S', name: "Spade" }];
var numberOfDeck = 2;
var _choiceCard;

var connections = [];
var roomNum = 1;
var roomSize = 8

server.listen(port, function () {
    log('Server listening at port ' + port);
    log(players.length);
});

app.use(express.static(__dirname + '/public'));

var log = function (obj) {
    console.log(JSON.stringify(obj));
};

var prepareDeckAndShuffle = function () {

    // load number of decks
    deck = [];

    for (var n = 0; n < numberOfDeck; n++) {
        for (var i = 0; i < cardTyes.length; i++) {
            for (var j = 1; j <= 13; j++) {
                var card = {};
                card.params = { name: cardTyes[i].key + j, num: j, cardType: cardTyes[i].key }
                deck.push(card);
            }
        }
    }

    //shuffle deck
    var currentIndex = deck.length, tempValue, randomIndex

    while (0 !== currentIndex) {
        // pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // and swap it with the current element
        tempValue = deck[currentIndex];
        deck[currentIndex] = deck[randomIndex];
        deck[randomIndex] = tempValue;
    }
    log('Deck Prepared');
};

var dealGame = function () {

    io.sockets.emit('GAME_ON_OFF', { gameOn: true });

    for (var i = 0; i < 5; i++) {
        players.forEach(function (player) {
            //get the top card
            var card = deck[0];

            if (player.name != null) {
                player.hands = player.hands || [];
                player.hands.push(card);

                deck.splice(0, 1);
            }
        });

        //chice card 
        _choiceCard = deck[0];
        deck.splice(0, 1);
    }

    io.sockets.emit('UPDATE_PLAYERS', { players: players, choiceCard: _choiceCard });
    //io.sockets.emit('CHOICE_CARD_SELECTED', { choiceCard: _choiceCard });

    log('Game Deal Completed');
};

io.sockets.on('connection', function (socket) {
    connections.push(socket.id);

    log('Connection started ' + socket.id + ', # of connections ' + connections.length);

    log(players.length);

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

        //log(connections);
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

        log(players.length);

        if (players.length == 1) {
            prepareDeckAndShuffle();
        }

        if (players.length == 2) {
            setTimeout(function(){ dealGame(); }, 3000);
        }

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
    socket.on("PREPARE_DECK", function (data) {
        var card = deck[0];
        deck.splice(0, 1);

        io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
    });

    // when player take a card 
    socket.on("TAKE_CARD", function (data) {
        var card = deck[0];
        deck.splice(0, 1);

        io.sockets.emit('UPDATE_USERS', { onlineUsers: users });
    });

});

