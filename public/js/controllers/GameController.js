var GameController = function ($scope, $rootScope, $ionicPopup, $state, $localStorage, AdMob, Jyap, socket) {

    var playerPositions, players;
    var updatePlayerPosition = false;
    var gameOn = false;
    var gameInProgress = false;
    var choiceCard;
    var choiceCardObj;
    var thisPlayer;
    var playerLeft;
    var isPlayerLeft;
    var playerInTurn;
    var maxPlayers = 4;

    var throwComplete;

    var thrownCards;
    //var thrownCardsHistory;

    var gameWidth = 640;
    var gameHeight = 360;

    var timer;
    var timeArc;

    //message text
    var messages = [];

    var _style = { font: "10px Arial", fill: "#fff" };
    var _style0 = { font: "12px Arial", fill: "#fff" };
    var _style1 = { font: "14px Arial", fill: "#fff" };


    /* Socket Implementation */
    socket.on('connect', function () {

        this.connected = true

        //Add user
        //socket.emit('PLAYER_JOINED', data.name);
        if ($rootScope.player == undefined)
        {
            $state.go('app.home');
        } else {
            thisPlayer = $rootScope.player;
        }
        //$localStorage.player = thisPlayer;
        socket.emit('PLAYER_JOINED', thisPlayer);

        // Whenever the server emits 'new message', update the chat body
        socket.on('NEW_MESSAGE', function (msg) {
            messages.push(msg);
            gameState.displayMessage();
        });

        socket.on('UPDATE_BALANCE', function (data) {
            players = data;
            gameState.updateBalance();
        });


        socket.on('UPDATE_GAME', function (data) {
            players = data.players;
            choiceCardObj = data.choiceCard;

            if (thisPlayer.id == undefined) {
                thisPlayer = data.thisPlayer;
            }

            // update new player's positions
            updatePlayerPosition = true;

            console.log("player joined " + thisPlayer.nickname)
            //gameState.displayMessage("Player joined " + thisPlayer.nickname);
            if (choiceCardObj != undefined) {
                console.log("Choice Card is " + choiceCardObj.params.name);
                setTimeout(function () {
                    gameState.showChoiceCard();
                    gameState.showMyCards();
                }, 1000);
            }
        });

        socket.on('PLAYER_LEFT', function (data) {
            playerLeft = data.player;
            isPlayerLeft = true;
            //console.log("player left " + playerLeft.nickname)
            messages.push("Player " + thisPlayer.nickname + " left!");
        });

        socket.on('GAME_ON_OFF', function (data) {
            gameOn = data.gameOn;
            console.log("Game is on now.");
            messages.push("Game is on now.");
        });

        socket.on('CHOICE_CARD_SELECTED', function (data) {
            choiceCardObj = data.choiceCard;
            gameState.showChoiceCard();
            gameState.showMyCards();
            gameInProgress = true;
            console.log("Choice Card is " + choiceCardObj);
        });

        socket.on("CARDS_THROW", function (data) {
            thrownCards = thrownCards || [];
            thrownCards.push(data);
            gameState.showThrowCards()
        });

        socket.on("CARD_FROM_FLOOR", function (data) {
            console.log("Card " + data.name + " taken from floor");
            messages.push("Card " + data.name + " taken from floor");
            gameState.killOldThrowCards()
        });

        socket.on("CHANGE_TURN", function (data) {
            playerInTurn = data;
            gameState.resetSelection();
        });

        socket.on("CHOICE_CARD_TAKEN", function () {
            gameState.killChoiceCard();
            console.log("chiceCard gone");
        });

        socket.on("CHOICE_CARD_IGNORED", function () {
            gameState.killChoiceCard();
            gameState.enableDeck();
        });

         socket.on("RESET_GAME", function () {
             console.log("game reset");
            gameState.resetGame();
        });


        // when a user take a new card from deck
        socket.on("CARD_FROM_DECK", function (new_card) {
            gameState.addNewCardFromDeck(new_card);
        });

        // socket.on("GAME_CALL_UPDATE", function (player) {
        //     gameState.gameCalledSendUpdate();
        //     console.log("Game Called by  " + player.nickname);
        //     messages.push("Game Called by  " + data.nickname);
        // });

        //Whenever the server emits 'typing', show the typing message
        socket.on('DRAG_CARD', function (data) {
            console.log(data);

        });

        socket.on('NEW_GAME', function (data) {
            game.state.start('gameState');
        });


        // Whenever the server emits 'stop typing', kill the typing message
        socket.on('stop typing', function (data) {
            //removeChatTyping(data.username);
        });
    });

    /* Game Over */
    var gameOver = {
        create: function () {
            console.log("game over");
        }
    };

    /* Boot State */
    var bootState = {
        create: function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.state.start('loadState');
        }
    };

    /* preload states */
    var cardTyes = [
        { key: 'C', name: 'Club' },
        { key: 'D', name: "Diamond" },
        { key: 'H', name: "Heart" },
        { key: 'S', name: "Spade" }];

    var loadState = {
        init: function () {

            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            //this.scale.minWidth = gameWidth/2;            
            //this.scale.minHeight = gameHeight/2;            
            //this.scale.maxWidth = 2048; 
            //You can change this to gameWidth*2.5 if needed            
            //this.scale.maxHeight = 1228; 
            //Make sure these values are proportional to the gameWidth and gameHeight            
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            //this.scale.forceOrientation(false, true);            
            //this.scale.hasResized.add(this.gameResized, this);            
            //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);            
            //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);            
            //this.scale.setScreenSize(true);        
        },
        preload: function () {
            var loadingLavel = this.game.add.text(100, this.game.world.centerX, 'loading ... ', { font: '30px Courier', fill: '#fff' });

            // Load Background
            this.load.image('background', 'assets/images/background.jpg');
            this.game.add.sprite(0, 0, 'background');
            this.load.image('circle', 'assets/images/circle.png');
            this.load.image('desk', 'assets/images/desk.png');
            this.load.image('other-card', 'assets/images/other-cards.png');

            //Turn signals
            this.load.image('signal-green', 'assets/images/signal_green.png');
            this.load.image('signal-red', 'assets/images/signal_red.png');

            // Exit callButton
            this.load.image('exit', 'assets/ui/kenney/images/red_boxCross.png')

            // load card back
            this.load.image('deck-back', 'assets/images/card-back.png');
            this.load.image('deck-back-floor', 'assets/images/card-back-floor.png');

            //user action buttons
            //this.load.image('green-button', 'assets/images/green_button.png');
            //this.load.image('red-button', 'assets/images/red_button.png');
            this.load.image('button', 'assets/images/button.png');
            this.load.image('playnow', 'assets/images/playnow.png');

            //user sprite
            this.load.spritesheet('avatar', 'assets/images/user_spritesheet.png', 50, 50, 41);
            this.load.image('avatar_na', 'assets/images/avatar.png');

            //load all cards
            cardTyes.forEach(function (item) {
                for (var j = 1; j <= 13; j++) {
                    this.load.image(item.key + j, 'assets/images/cards/' + item.key + j + '.png');
                }
            }, this);
        },
        create: function () {

            this.background = this.game.add.sprite(0, 0, 'background');
            this.background.width = this.game.world.width;
            this.background.height = this.game.world.height;

            this.game.state.start('menuState');
        }
    };


    /* Menu State */
    var menuState = {
        init: function () {
            // let's start socket communication so that we can talk

            playerPositions1 = [
                { x: this.game.world.width / 2, y: this.game.world.height - 35, x1: this.game.world.centerX + 30, y1: this.game.world.height - 70 },
                { x: this.game.world.width - 35, y: this.game.world.height - 35, x1: this.game.world.width - 90, y1: this.game.world.height - 70 },
                { x: this.game.world.width - 35, y: this.game.world.centerY, x1: this.game.world.width - 90, y1: this.game.world.centerY },
                { x: this.game.world.width - 35, y: 35, x1: this.game.world.width - 90, y1: 70 },
                { x: this.game.world.centerX, y: 35, x1: this.game.world.centerX, y1: 90 },
                { x: 35, y: 35, x1: 90, y1: 70 },
                { x: 35, y: this.game.world.centerY, x1: 90, y1: this.game.world.centerY },
                { x: 35, y: this.game.world.height - 35, x1: 90, y1: this.game.world.height - 50 }
            ];

            playerPositions = [
                { x: this.game.world.width / 2, y: this.game.world.height - 35, x1: this.game.world.centerX + 30, y1: this.game.world.height - 70 },
                { x: this.game.world.width - 35, y: this.game.world.centerY, x1: this.game.world.width - 90, y1: this.game.world.centerY },
                { x: this.game.world.centerX, y: 35, x1: this.game.world.centerX, y1: 90 },
                { x: 35, y: this.game.world.centerY, x1: 90, y1: this.game.world.centerY }
            ];

        },
        preload: function () {
            //slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
            //this.load.image('background', 'assets/images/background.jpg');
            //slickUI.load('assets/ui/kenney/kenney.json');

        },
        inputFocus: function (sprite) {
            sprite.canvasInput.focus();
        },
        create: function () {
            background = this.game.add.sprite(0, 0, 'background');
            background.width = this.game.world.width;
            background.height = this.game.world.height;

            game.state.start('gameState');
        }
    };

    /* Main Game Stat */
    var gameState = {
        create: function () {

            //add some groups to hold the group of sprites
            this.backgroundGroup = this.game.add.group();
            this.floorGroup = this.game.add.group();
            this.throwCardsGroup = this.game.add.group();

            this.myHandCardsGroup = this.game.add.group();

            this.playersGroup = this.game.add.group();
            
            this.otherUIGroup = this.game.add.group();
            this.balanceDisplayGroup = this.game.add.group();


            // set the fixed background
            this.prepareGameBackground();

            // let's add two rectangles to perform user action
            this.prepareOtherUIComponents();

            //this.startTimerWheel();

        },
        prepareOtherUIComponents: function () {

            //this player desk on position
            var pos = playerPositions[0];
            desk = this.otherUIGroup.create(pos.x, pos.y, 'desk');
            desk.anchor.setTo(0.5, 0.5);
            desk.scale.setTo(0.52);

            var bmd = game.add.bitmapData(60, 20);

            // draw to the canvas context like normal
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, 60, 20);
            bmd.ctx.fillStyle = '#000';
            bmd.ctx.fill();

            //this.throwButton = new Phaser.Graphics(this.game, 200, this.game.world.height - 22);
            this.throwButton = this.otherUIGroup.create(200, this.game.world.height - 22, bmd);
            this.throwButton.alpha = 0.70;
            this.throwButton.inputEnabled = true;
            this.throwButton.input.pixelPerfectClick = true;
            this.throwButton.input.priorityID = 2;
            this.throwButton.events.onInputUp.add(this.throwCards, this);

            this.callButton = this.otherUIGroup.create(380, this.game.world.height - 22, bmd);
            this.callButton.alpha = 0.70;
            this.callButton.inputEnabled = true;
            this.callButton.input.useHandCursor = true;
            this.callButton.input.priorityID = 2;
            this.callButton.events.onInputUp.add(this.callGame, this);

            // play now button
            if (thisPlayer.isDealer){
            this.playnowButton = this.otherUIGroup.create(this.game.world.centerX, this.game.world.centerY + 75, 'playnow'); 
            this.playnowButton.anchor.set(0.5);    
            this.playnowButton.scale.setTo(0.75)     
            this.playnowButton.inputEnabled = true;
            this.playnowButton.input.useHandCursor = true;
            this.playnowButton.input.priorityID = 2;
            this.playnowButton.events.onInputUp.add(this.startGame, this);
            }
            // add exit button
            this.exitButton = this.otherUIGroup.create(this.game.world.centerX + 150, this.game.world.height - 25, 'exit');
            this.exitButton.anchor.setTo(0.5);

            this.exitButton.inputEnabled = true;
            this.exitButton.events.onInputUp.addOnce(function () {
                socket.emit('PLAYER_LEFT', thisPlayer);
                $state.go('app.home');
            }, this);

            // floor marker
            circle = this.game.add.graphics(0, 0);
            circle.anchor.setTo(0.5);

            //  Our first arc will be a line only
            circle.lineStyle(1, 0xffd900);
            circle.drawCircle(game.world.centerX + 150, game.world.centerY - 50, 150)

            this.floorGroup.add(circle);

            floorText = this.game.add.text(game.world.centerX + 150, game.world.centerY - 50, "FLOOR", _style0);
            floorText.anchor.set(0.5);

            this.floorGroup.add(floorText);

            //Message Bar
            messageBox = this.game.add.text(game.world.centerX, game.world.centerY + 40, "Welcome to Jyap", _style1);
            messageBox.anchor.set(0.5);

        },

        resetGame: function(){
            
            
            this.myHandCardsGroup.removeAll(); 
            this.throwCardsGroup.removeAll();
            //this.playersGroup.removeAll(); 
            //this.otherUIGroup.removeAll();
            //this.balanceDisplayGroup.removeAll(); 
        },
        startGame: function(){
            socket.emit("START_GAME");
            this.playnowButton.destroy();
        },
        resetSelection: function () {
            this.selectedCards = [];
            throwComplete = false;
        },
        updateBalance: function(){
            // look for all children of this.playersGroup
            this.balanceDisplayGroup.forEach(function (item) {
                
                    for (m=0; m < players.length; m++) {
                        if (players[m].id == item.data.player.id) {
                            item.text = players[m].balance;
                            break;
                        }
                    }
            });
        },
        updateSelectedCards: function (sprite, events) {
            handSelected = handSelected || [];
            sprite.hands.params.selected = true;
            sprite.y -= 20;
            handSelected.push(sprite);
        },
        highlightsPlayerInTurn: function () {

            if (playerInTurn.id == thisPlayer.id) {
                this.greenSignal.moveUp();
            } else {
                this.greenSignal.moveDown();
            }
        },
        startTimerWheel: function () {
            timeArch = this.game.add.graphics(game.world.centerX, game.world.centerY);

            //  Our first arc will be a line only
            timeArch.lineStyle(8, 0xffd900);

            // graphics.arc(0, 0, 135, game.math.degToRad(0), game.math.degToRad(90), false);
            var i = 0;
            timer = this.game.time.events.loop(Phaser.Timer.SECOND, function (_timer) {
                timeArch.arc(0, 0, 40, 0, i, false);
                i += 0.1;
                if (i > 2) {
                    timeArch.kill();
                    this.game.time.events.remove(timer);
                    this.startTimerWheel();
                }
            }, this);
        },
        update: function () {
            // console.log('update calling');

            if (updatePlayerPosition) {
                this.positionPlayers();
            }

            if (isPlayerLeft) {
                this.removePlayer();
            }

            if (playerInTurn != undefined) {
                this.highlightsPlayerInTurn();

                if (Jyap.isValidCardPick(this.selectedCards) && playerInTurn.id == thisPlayer.id) {
                    this.throwButton.inputEnabled = true;
                    this.throwButton.alpha = 0;
                } else {
                    this.throwButton.inputEnabled = false;
                    this.throwButton.alpha = 0.75;
                }

                if (playerInTurn.id == thisPlayer.id) {
                    this.callButton.inputEnabled = true;
                    this.callButton.alpha = 0;
                } else {
                    this.callButton.inputEnabled = false;
                    this.callButton.alpha = 0.75;
                }
            }

            if (throwComplete) {
                this.throwButton.inputEnabled = false;
                this.throwButton.alpha = 0.75;
            }
        },
        gameCalledSendUpdate: function () {
            socket.emit("CALL_CALL_UPDATE", thisPlayer.points);
        },
        makeCardSelection: function (card, event) {
            this.selectedCards = this.selectedCards || [];
            if (event.id === 2) {
                card.params.selected = !card.params.selected;

                if (card.params.selected) {
                    card.y -= 25;
                    //card.angle -= 5;
                    this.selectedCards.push(card.params);
                    console.log("card selected " + card.params.name);
                }
                else {
                    card.y += 25;
                    //card.angle += 5;

                    this.selectedCards.splice(this.selectedCards.indexOf(card.params), 1);
                    console.log("card unselected " + card.params.name);
                }
            }
        },
        addNewCardFromDeck: function (card) {
            if (playerInTurn.id == thisPlayer.id) {
                // add card into this players hands
                thisPlayer.hands.push(card);

                // reArrangeMyCards
                this.reArrangeMyCards();

                //change turn
                socket.emit("CHANGE_TURN", thisPlayer);
            }
            this.killOldThrowCards();

        },
        disableDeck: function () {
            this.deck.inputEnabled = false;
        },
        enableDeck: function () {

            var newcard = this.myHandCardsGroup.create(this.deck.x, this.deck.y, 'deck-back-floor');
            newcard.anchor.setTo(0.5);
            newcard.angle = 65;
            newcard.scale.setTo(0.70);

            newcard.inputEnabled = true;
            newcard.input.enableDrag();

            newcard.events.onDragStop.add(function (_temp) {
                if (this.checkOverlap(_temp, this.myHandCardsGroup)) {
                    this.selectedCards = [];
                    socket.emit("CARD_FROM_DECK");
                    _temp.kill();
                }
            }, this);
        },

        killChoiceCard: function () {
            this.choiceCard.kill();
            //this.enableDeck();
        },
        showChoiceCard: function () {
            this.choiceCard = this.game.add.sprite(150, 150, choiceCardObj.params.name);
            this.choiceCard.scale.setTo(0.50);
            this.choiceCard.anchor.setTo(0.75, 1);
            this.choiceCard.angle = 65;
            this.choiceCard.params = choiceCardObj.params;
            this.choiceCard.params.selected = false;

            this.choiceCard.inputEnabled = true;
            //this.choiceCard.input.enableDrag();

            this.choiceCard.events.onDragStop.add(function () {
                console.log('Drag Stopped');

                if (this.checkOverlap(this.choiceCard, this.myHandCardsGroup)) {

                    thisPlayer.hands.push({ 'params': this.choiceCard.params });

                    var card = this.myHandCardsGroup.create(this.game.world.centerX, this.game.world.height - 100, this.choiceCard.params.name);

                    card.params = this.choiceCard.params;
                    card.params.selected = false;

                    card.inputEnabled = true;

                    card.input.pixelPerfectClick = true;
                    card.input.priorityID = 100;
                    card.events.onInputUp.add(this.makeCardSelection, this);

                    this.reArrangeMyCards();

                    socket.emit("CHOICE_CARD_TAKEN", true);
                    socket.emit("CHANGE_TURN", thisPlayer);
                    
                }

                if (this.checkOverlap(this.choiceCard, this.floorGroup)) {
                    socket.emit("CHOICE_CARD_IGNORED");
                }

            }, this);


        },
        killOldThrowCards: function () {
            if (thrownCards.length > 1) {
                thrownCards.splice(0, 1)
            }
            //socket.emit("CHANGE_TURN");
            this.showThrowCards();
        },

        showThrowCards: function () {

            var sPosX = this.game.world.centerX + 100 + (Math.random() * 10);
            var sPosY = 100 + (Math.random() * 10);

            this.throwCardsGroup.removeAll();

            thrownCards.forEach(function (items) {
                items.forEach(function (item) {

                    var card = this.throwCardsGroup.create(sPosX, sPosY, item.name);

                    card.anchor.setTo(0.5);
                    card.scale.setTo(0.40, 0.40);
                    card.angle += Math.random() * 100;

                    card.params = item;
                    card.params.selected = false;

                    card.inputEnabled = true;
                    card.input.enableDrag();

                    card.events.onDragStart.add(function (_card) {
                        _card.bringToTop();
                    });

                    card.events.onDragStop.add(function (_card) {

                        if (this.checkOverlap(_card, this.myHandCardsGroup)) {

                            thisPlayer.hands.push({ 'params': _card.params });

                            this.reArrangeMyCards();

                            socket.emit("CARD_FROM_FLOOR", thisPlayer, _card.params);
                            socket.emit("CHANGE_TURN", thisPlayer);

                            _card.destroy();

                        }

                    }, this);


                    sPosX += 30;
                    sPosY += 30;
                }, this);
            }, this);
        },

        //spriteA card, spriteB : group
        checkOverlap: function (spriteA, spriteB) {
            var boundsA = spriteA.getBounds();
            var boundsB = spriteB.getBounds();

            return boundsA.intersects(boundsB);
        },
        reArrangeMyCards: function () {

            //let's clear and redraw
            this.myHandCardsGroup.removeAll();


            var cardCount = thisPlayer.hands.length;
            var offset = 50;
            var startPos = this.game.world.centerX - ((cardCount * offset) / 2);

            thisPlayer.points = 0;

            thisPlayer.hands.forEach(function (card) {
                var myCard = this.myHandCardsGroup.create(startPos, this.game.world.height - 100, card.params.name);
                myCard.scale.setTo(0.35, 0.35);

                myCard.params = card.params;
                myCard.params.selected = false;

                if (card.params.num >= 10) {
                    thisPlayer.points += 10
                } else {
                    thisPlayer.points += card.params.num
                }

                console.log("My points is " + thisPlayer.points);

                myCard.inputEnabled = true;
                myCard.input.pixelPerfectClick = true;
                myCard.input.pixelPerfectOver = true;
                myCard.input.priorityID = 100;
                myCard.events.onInputUp.add(this.makeCardSelection, this);

                startPos += offset;
            }, this);

            this.isOnTurn = false;
        },
        showMyCards: function () {

            for (var i = 0; i < players.length; i++) {
                if (players[i].id == thisPlayer.id) {
                    thisPlayer.hands = players[i].hands;
                    break;
                }
            }

            var cardCount = thisPlayer.hands.length;
            var offset = 50;
            var startPos = this.game.world.centerX - ((cardCount * offset) / 2);

            thisPlayer.hands.forEach(function (card) {
                var myCard = this.myHandCardsGroup.create(startPos, this.game.world.height - 100, card.params.name);
                myCard.scale.setTo(0.35, 0.35);

                myCard.params = card.params;
                myCard.params.selected = false;


                myCard.inputEnabled = true;
                myCard.input.pixelPerfectClick = true;
                myCard.input.pixelPerfectOver = true;
                myCard.input.priorityID = 100;
                myCard.events.onInputUp.add(this.makeCardSelection, this);

                startPos += offset;
            }, this);

            //this.game.world.moveUp(this.myHandCardsGroup);
            //socket.emit("new message", "deal completed");

        },
        prepareGameBackground: function () {
            this.background = this.backgroundGroup.create(0, 0, 'background');
            this.background.width = this.game.world.width;
            this.background.height = this.game.world.height;

            this.deck = this.backgroundGroup.create(175, 125, 'deck-back-floor');
            this.deck.angle = 60;
            this.deck.anchor.setTo(0.5);
            this.deck.scale.setTo(0.75);

            //Red Green Signals 
            this.greenSignal = this.backgroundGroup.create(this.game.world.centerX, this.game.world.centerY, 'signal-green');
            this.greenSignal.anchor.setTo(0.5);
            this.greenSignal.scale.setTo(0.5, 0.5);

            this.redSignal = this.backgroundGroup.create(this.game.world.centerX, this.game.world.centerY, 'signal-red');
            this.redSignal.anchor.setTo(0.5);
            this.redSignal.scale.setTo(0.5, 0.5);

        },
        removePlayer: function () {
            isPlayerLeft = false;
            //this.playersGroup.removeAll(true, true);

            //
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == playerLeft.id) {
                    players[i] = {};
                    break;
                }
            }

            // look for all children of this.playersGroup
            this.playersGroup.forEach(function (item) {
                if (item.data.player != undefined && item.data.player.id == playerLeft.id) {
                    if (item.key == 'avatar') {
                        item.loadTexture('avatar_na');
                        item.scale.setTo(0.90);

                    } else {
                        item.kill();
                    }
                }
            });
        },
        callGame: function (button, event) {
            if (event.id === 1) {
                thisPlayer.isCalled = true;
                socket.emit("CALL_GAME", thisPlayer);
            }
        },
        throwCards: function (button, event) {

            if (event.id === 1) {
                // var n = 0;
                // this.myHandCardsGroup.forEach(function (_sprite) {
                //     if (_sprite.params.selected) {
                //         console.log("selected card is " + _sprite.params.name + " removed from player hands")

                //         this.myHandCardsGroup.remove(_sprite);
                //         _sprite.destroy();
                //         _sprite.kill();

                //         console.log("now this player has  " + this.myHandCardsGroup.length + " card in had");
                //     }
                // }, this);

                this.selectedCards.forEach(function (_card) {
                    thisPlayer.hands.forEach(function (_hand) {
                        if (_card.name == _hand.params.name) {
                            thisPlayer.hands.splice(thisPlayer.hands.indexOf(_hand), 1);
                        }
                    }, this);
                }, this);

                this.reArrangeMyCards();


                if (this.choiceCard.alive) {
                    this.choiceCard.input.draggable = true;
                } else {
                    this.enableDeck();
                }

                throwComplete = true;

                socket.emit("CARDS_THROW", this.selectedCards);
            }
        },
        displayMessage: function()
        {   
           //if (messageBox == undefined) return;
           if (messages.length > 0)
           {
            messageBox.text = messages[messages.length-1];
            messages.splice(messages.length-1, 1);
           }
            
            setTimeout(this.displayMessage, 2000);
        },
        positionPlayers: function () {
            updatePlayerPosition = false;
            this.playersGroup.removeAll(true, true);

            //let's re-order the list of player and start positioning from bottom center;
            while (players[0].nickname.toUpperCase() != thisPlayer.nickname.toUpperCase()) {
                players.push(players[0]);
                players.splice(0, 1);
            }

            // add black player for placeHolder
            for (var i = players.length; i < maxPlayers; i++) {
                players.push({});
            }

            var pos_idx = 0;
            players.forEach(function (item) {
                var pos = playerPositions[pos_idx];

                if (item.nickname != null) {
                    var tempPlayer;
                    var tempCircle;
                    var desk;

                    if (pos_idx == 0) {
                        tempPlayer = this.playersGroup.create(pos.x, pos.y, 'avatar', Math.floor(Math.random() * 41));
                        tempPlayer.anchor.setTo(0.5, 0.25);
                        tempPlayer.scale.setTo(1.55);
                        tempPlayer.data.player = item;

                        // Name and balance
                        var name = game.add.text(pos.x - 120, pos.y - 12, item.nickname.toUpperCase(), _style0);
                        name.data.player = item;
                        this.otherUIGroup.add(name);

                        var balance = game.add.text(pos.x + 75, pos.y - 12, item.balance, _style0);
                        balance.data.player = item;
                        this.balanceDisplayGroup.add(balance);

                    } else {

                        tempPlayer = this.playersGroup.create(pos.x, pos.y, 'avatar', Math.floor(Math.random() * 41));
                        tempPlayer.anchor.setTo(0.5);
                        tempPlayer.data.player = item;

                        //other players card;
                        var smallCard = this.playersGroup.create(pos.x1, pos.y1, 'other-card');
                        smallCard.data.player = item;
                        smallCard.anchor.set(0.5);
                        smallCard.scale.setTo(0.30);

                        tempCircle = this.playersGroup.create(pos.x, pos.y, 'circle');
                        tempCircle.data.player = item;
                        tempCircle.anchor.setTo(0.5);
                        tempCircle.scale.setTo(0.30);


                        // balance of the other player
                        var balance = this.game.add.text(pos.x, pos.y - 26, "$" + item.balance, _style);
                        balance.data.player = item;
                        balance.key = item.id;
                        balance.anchor.set(0.5);

                        // name of the other players
                        var name = this.game.add.text(pos.x, pos.y + 28, item.nickname.toUpperCase(), _style);
                        name.data.player = item;
                        name.key = item.id;
                        name.anchor.set(0.5);

                        this.playersGroup.add(name);
                        this.balanceDisplayGroup.add(balance);


                    }
                } else {
                    //npPlayer = playersGroup.create(pos.x, pos.y, 'avatar_na')
                    var naPlayer = this.playersGroup.create(pos.x, pos.y, 'avatar_na');
                    naPlayer.anchor.setTo(0.5);
                    naPlayer.scale.setTo(0.90);

                    tempCircle = this.playersGroup.create(pos.x, pos.y, 'circle');
                    tempCircle.anchor.setTo(0.5);
                    tempCircle.scale.setTo(0.30);
                }
                pos_idx++;
            }, this);

            //this.game.world.bringToTop(this.playersGroup);
        }
    }



    $scope.startGame = function () {

        //game = new Phaser.Game(window.innerWidth * window.devicePixelRatio/2, (window.innerHeight * window.devicePixelRatio/2) - 0.05 * window.devicePixelRatio/2, Phaser.AUTO, 'gameArea');
        //game = new Phaser.Game(1024, 738, Phaser.CANVAS, 'gameArea');
        //game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'gameArea');
        game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameArea');

        game.state.add('bootState', bootState);
        game.state.add('loadState', loadState);
        game.state.add('menuState', menuState);
        game.state.add('gameState', gameState);
        game.state.add("gameOver", gameOver);

        //Start the first state
        game.state.start('bootState');
    }

};
