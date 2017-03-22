var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3200;

var players = [];
var deck;
var rooms = [];

var isGameOn = false;
var playerInTurn = 0;

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
    log('Welcome to Jyap Server listening at port ' + port);
});

app.use(express.static(__dirname + '/public'));

var log = function (obj) {
    console.log(JSON.stringify(obj));
};

var prepareDeckAndShuffle = function () {

    // load number of decks
    deck = [];

    //log(numberOfDeck);
    //log(cardTyes.length)

    for (var n = 0; n < numberOfDeck; n++) {
        for (var i = 0; i < cardTyes.length; i++) {
            for (var j = 1; j <= 13; j++) {

                var card = {};
                // log(cardTyes[i].key + j);
                card.params = { name: cardTyes[i].key + j, num: j, cardType: cardTyes[i].key }
                deck.push(card);

                //log(card.params.name + ' ' + card.params.num);
            }
        }
    }

    //log(deck.length);
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
    isGameOn = true;

    io.sockets.emit('GAME_ON_OFF', { gameOn: isGameOn });

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < players.length; j++) {
            var card = deck[0];
            players[j].hands = players[j].hands || [];
            players[j].hands.push(card);
            deck.splice(0, 1);

            log('Player ' + players[j].nickname + ' got ' + card.params.name);
        }
    }

    //chice card 
    _choiceCard = deck[0];
    deck.splice(0, 1);

    io.sockets.emit('UPDATE_PLAYERS', { players: players, thisPlayer: null, choiceCard: _choiceCard});
    io.sockets.emit('CHANGE_TURN', players[playerInTurn]);
    //io.sockets.emit('CHOICE_CARD_SELECTED', { choiceCard: _choiceCard });

    log('Game Deal Completed');
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

        log(players.length);

        if (players.length == 1) {
            data.starter = true;
            prepareDeckAndShuffle();
        }

        players.push(data);

        if (players.length >= 2) {
            setTimeout(function () { dealGame(); }, 5000);
        }

        io.sockets.emit('UPDATE_PLAYERS', { players: players, thisPlayer: data, choiceCard: null });

    });

    // when player hit the exit button
    socket.on('PLAYER_LEFT', function (data) {
        // var playerLeft;

        // for (var i = 0; i < players.length; i++) {
        //     if (players[i].id == data.id) {
        //         playerLeft = players[i];
        //         players.splice(i, 1);
        //         break;
        //     }
        // }

        log('Player ' + data.nickname + ' left');

        socket.disconnect();
        //io.sockets.emit('PLAYER_LEFT', { player: playerLeft });
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

    // when player take a card 
    socket.on("CARDS_THROW", function (data) {
        io.sockets.emit('CARDS_THROW', data);
    });

    socket.on("CHANGE_TURN", function (data) {
        log("CHANGE_TURN called");
        playerInTurn++;
        io.sockets.emit("CHANGE_TURN", players[playerInTurn]);
    });

    socket.on("DRAG_CARD", function (data) {
        io.sockets.emit("DRAG_CARD", data);
    });


});

