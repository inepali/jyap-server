var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 3200;

var players = [];
var deck;
var rooms = [];
var card;

var isGameOn = false;
var playerInTurn = 0;

var gameRates = [1, 2, 4];
var penaltyRate = 10;

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
    log('Welcome to Jhyap Server listening at port ' + port);
});

app.use(express.static(__dirname + '/public'));

var log = function (obj) {
    console.log(JSON.stringify(obj));
};

var comparePoints = function (p1, p2) {
    if (p1.points < p2.points)
        return -1;
    if (p1.points > p2.points)
        return 1;
    return 0;
}



var resetGame = function () {
    console.log('RESET GAME');
    io.sockets.emit("RESET_GAME");
    io.sockets.emit('CARDS_THROW', []);
    setTimeout(dealGame, 3000);
};

var checkResults = function () {

    // let's sort all player based on their points
    players.sort(comparePoints);
    //console.log(players);

    // check first index is caller;
    if (players[0].isCalled) {
        io.sockets.emit("NEW_MESSAGE", 'IT IS A JHYAP');
        io.sockets.emit("NEW_MESSAGE", players[0].nickname + ' is the winner!');
        // let's least point index 1 will pay low value to the winner


        if (players.length == 2) {
            players[0].balance += gameRates[1];
            players[1].balance -= gameRates[1];
        } else if (players.length == 3) {
            players[0].balance += gameRates[0];
            players[1].balance -= gameRates[0];

            players[0].balance += gameRates[2];
            players[1].balance -= gameRates[2];
        } else {

            players[0].balance += gameRates[0];
            players[1].balance -= gameRates[0];

            // le'ts high point pay highest Game Rate gameRates[2]
            players[0].balance += gameRates[2];
            players[players.length - 1] -= gameRates[2];

            for (var i = 2; i < players.length - 1; i++) {
                players[0].balance += gameRates[1];
                players[i].balance -= gameRates[1];
            }
        }
    } else {

        io.sockets.emit("NEW_MESSAGE", 'IT IS A PENALTY');
        // let's find out who called the game, pay the penalty
        for (var i = 1; i < players.length; i++) {
            if (players[i].isCalled) {
                players[0].balance += penaltyRate;
                players[i].balance -= penaltyRate;
                io.sockets.emit("NEW_MESSAGE", players[0].nickname + ' is the winner!');
                players[i].isCalled = false;
                break;
            }
        }
    }

    io.sockets.emit('UPDATE_BALANCE', players);
    //io.sockets.emit("NEW_MESSAGE", 'GAME OVER');
    io.sockets.emit("NEW_MESSAGE", players[0].nickname + ' is the winner!');

    resetPlayers();

    setTimeout(resetGame, 3000);


};

var prepareDeckAndShuffle = function () {

    // load number of decks
    deck = [];

    for (var n = 0; n < numberOfDeck; n++) {
        for (var i = 0; i < cardTyes.length; i++) {
            for (var j = 1; j <= 13; j++) {
                var card = {};
                // log(cardTyes[i].key + j);
                card.params = { name: cardTyes[i].key + j, num: j, cardType: cardTyes[i].key }
                deck.push(card);
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

    log('Deck Ready');
};

var resetPlayers = function () {
    console.log('resetting all players');
    for (var j = 0; j < players.length; j++) {
        players[j].hands = [];
        players[j].isCalled = false;
        players[j].isDealer = false;
    }
console.log('dealer set to ' + players[0].nickname);
    players[0].isDealer = true;
};

var dealGame = function () {
    isGameOn = true;
    playerInTurn = 0;

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

    io.sockets.emit('UPDATE_GAME', { players: players, thisPlayer: null, choiceCard: _choiceCard });
    console.log("Deal and set player in turn" + players[playerInTurn].nickname);
    io.sockets.emit('CHANGE_TURN', players[playerInTurn]);
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
        io.sockets.emit('UPDATE_GAME', { players: players, thisPlayer: null, choiceCard: _choiceCard });
    });

    socket.on("CARD_FROM_DECK", function (data) {
        var card = deck[0];
        deck.splice(0, 1);

        io.sockets.emit('CARD_FROM_DECK', card);
        console.log("new card taken from deck " + card.params.name);
    });

    // when player joined to room
    socket.on('PLAYER_JOINED', function (player) {

        player.id = socket.id;

        if (players.length == 1) {
            player.isDealer = true;
            prepareDeckAndShuffle();
        }

        players.push(player);

        io.sockets.emit('UPDATE_GAME', { players: players, thisPlayer: player, choiceCard: null });

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

    // when player throw a card 
    socket.on("CARDS_THROW", function (data) {
        io.sockets.emit('CARDS_THROW', data);
    });

    // when player take choice card 
    socket.on("CHOICE_CARD_TAKEN", function (data) {
        io.sockets.emit('CHOICE_CARD_TAKEN', data);
        io.sockets.emit("NEW_MESSAGE", 'CHOICE_CARD_TAKEN');
    });

    // when player ignore choice card 
    socket.on("CHOICE_CARD_IGNORED", function () {
        io.sockets.emit('CHOICE_CARD_IGNORED');
        console.log("CHOICE_CARD_IGNORED");
        io.sockets.emit("NEW_MESSAGE", 'CHOICE_CARD_IGNORED');
    });

    // when player take a card from floor
    socket.on("CARD_FROM_FLOOR", function (player, card) {
        io.sockets.emit('CARD_FROM_FLOOR', card);
        console.log("a card taken from floor ");
        io.sockets.emit("NEW_MESSAGE", 'CARD_FROM_FLOOR ' + player.nickname + " " + card.name);
    });

    socket.on("CHANGE_TURN", function (player) {
        if (playerInTurn == players.length - 1) {
            playerInTurn = 0;
        } else {
            playerInTurn++;
        }

        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                players[i] = player;
                console.log('Player ' + player.nickname + ' has ' + player.points + ' points in hand');
                break;
            }
        }

        console.log('Changing turn to ' + playerInTurn);

        io.sockets.emit("CHANGE_TURN", players[playerInTurn]);
        io.sockets.emit("NEW_MESSAGE", 'CHANGE_TURN TO ' + players[playerInTurn].nickname.toUpperCase());
    });

    socket.on("DRAG_CARD", function (data) {
        io.sockets.emit("DRAG_CARD", data);
    });

    socket.on("START_GAME", function () {
        dealGame();
    });

    // when one player called game
    socket.on("CALL_GAME", function (player) {

        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                players[i] = player;
                console.log(player.nickname + ' called game with ' + player.points + ' in hand');
                io.sockets.emit("NEW_MESSAGE", player.nickname + ' called game with ' + player.points + ' in hand');
                break;
            }
        }
        checkResults();
    });
});

