var gameState = {
			create: function () {

				//add a group for my hands

				this.throwCardsGroup = this.game.add.group();
				this.allPlayersGroup = this.game.add.group();
				this.myHandCardsGroup = this.game.add.group();


				// set the fixed background
				this.prepareGameBackground();

				// add deck background
				this.prepareDeckOnBackround();

				// prepareTwoDeck
				this.prepareDeckAndShuffle();

				// place all players
				this.positionPlayers();

				// let's add two rectangles to perform user action
				this.addActionButtons();

				// now deal a game
				this.dealGame();

				//show choice cards
				//this.showChoiceCard();

				// show my cards
				//this.showMyCards();
			},
			updateSelectedCards: function (sprite, events) {
				handSelected = handSelected || [];
				sprite.hands.params.selected = true;
				sprite.y -= 20;
				handSelected.push(sprite);
			},
			update: function () {
				console.log('update calling');
				

				this.validateCardPick();

			},
			makeCardSelection: function (card, event) {
				this.selectedCards = this.selectedCards || [];
				if (event.id === 1) {

					card.params.selected = !card.params.selected;

					if (card.params.selected) {
						card.y -= 25;
						card.angle -= 5;
						this.selectedCards.push(card);
					}
					else {
						card.y += 25;
						card.angle += 5;
						this.removeItemFromArray(this.selectedCards, card);
					}

				}
			},
			showChoiceCard: function () {
				this.choiceCard = this.game.add.sprite(150, 150, this.choice.params.name);
				this.choiceCard.scale.setTo(0.33, 0.33);
				this.choiceCard.anchor.setTo(0.75, 1);
				this.choiceCard.angle = 65;
				this.choiceCard.params = this.choice.params;
				this.choiceCard.params.selected = false;

				this.choiceCard.inputEnabled = true;


				this.choiceCard.events.onDragStop.add(function () {
					console.log('Drag Stopped');
					if (this.checkOverlap(this.choiceCard, this.myHandCardsGroup)) {

						this.choiceCard.inputEnabled = true;
						this.choiceCard.input.draggable = false;
						this.choiceCard.input.pixelPerfectClick = true;
						this.choiceCard.input.priorityID = 100;
						this.choiceCard.events.onInputUp.add(this.makeCardSelection, this);
						this.myHandCardsGroup.add(this.choiceCard);
						this.reArrangeMyCards();

						socket.emit('new message', 'Choice card taken' + this.choiceCard.params.name);


					}
				}, this);

			},
			// showThrowCards: function () {
			// 	var sPosX = this.game.world.centerX + 100;
			// 	var sPosY = this.game.world.centerY + 50;

			// 	this.thrownCards.forEach(function (card) {
			// 		var myCard = this.throwCardsGroup.create(sPosX, xPosY, card.params.name);

			// 		myCard.anchor.setTo(1, 1);
			// 		myCard.scale.setTo(0.40, 0.40);

			// 		sPosX += 30;
			// 		sPosY += 10;
			// 	}, this);
			// },
			reArrangeMyCards: function () {

				var cardCount = this.myHandCardsGroup.length;
				var offset = 40;
				var startPos = this.game.world.centerX - ((cardCount * offset) / 2);


				this.myHandCardsGroup.forEach(function (card) {
					card.x = startPos;
					card.y = this.game.world.height - 100;
					card.anchor.setTo(0, 0);
					card.scale.setTo(0.40, 0.40);
					card.angle = 0;

					startPos += offset;
				}, this);

				this.isOnTurn = false;
			},
			//spriteA card, spriteB : group
			checkOverlap: function (spriteA, spriteB) {
				var boundsA = spriteA.getBounds();
				var boundsB = spriteB.getBounds();

				return boundsA.intersects(boundsB);
			},
			showMyCards: function () {
				var cardCount = players[0].hands.length;
				var offset = 40;
				var startPos = this.game.world.centerX - ((cardCount * offset) / 2);

				selectedCards = [];

				players[0].hands.forEach(function (card) {
					var myCard = this.myHandCardsGroup.create(startPos, this.game.world.height - 100, card.params.name);
					myCard.scale.setTo(0.40, 0.40);
					//myCard.anchor.setTo(0,1);

					myCard.params = card.params;
					myCard.params.selected = false;

					//myCard.angle = 65;

					//myCard.scale.setTo(0.40, 0.40);
					//myCard.anchor.setTo(0,1);

					myCard.inputEnabled = true;
					myCard.input.pixelPerfectClick = true;
					myCard.input.priorityID = 100;
					myCard.events.onInputUp.add(this.makeCardSelection, this);

					startPos += offset;
				}, this);

				this.game.world.moveUp(this.myHandCardsGroup);
				socket.emit("new message", "deal completed");

			},
			login: function () {
				var panel;
        		slickUI.add(panel = new SlickUI.Element.Panel(8, 8, game.width - 16, game.height - 16));
				panel.alpha = 0;

				
				panel.add(new SlickUI.Element.Text(10,10, "Text input")).centerHorizontally().text.alpha = 0.5;
			},
			prepareGameBackground: function () {
				this.background = this.game.add.sprite(0, 0, 'background');
				this.background.width = this.game.world.width;
				this.background.height = this.game.world.height;
			},
			preparePlayers: function () {

			},
			shuffleDecks: function () {

			},
			validateCardPick: function () {

				var validPick = false;

				if (this.isOnTurn && this.selectedCards != undefined && this.selectedCards.length > 0) {

					if (this.selectedCards.length === 1) {
						validPick = true;
					} else if (this.selectedCards.length === 2) {
						var c1 = this.selectedCards[0];
						var c2 = this.selectedCards[1];

						if (c1.params.num == c2.params.num)
							validPick = true;

					} else if (this.selectedCards.length === 3) {

						var c1 = this.selectedCards[0];
						var c2 = this.selectedCards[1];
						var c3 = this.selectedCards[2];

						var isThreeCard = c1.params.num == c2.params.num && c2.params.num == c3.params.num;

						if (isThreeCard) {
							validPick = true;
						} else if (c1.params.cardType == c2.params.cardType && c2.params.cardType == c3.params.cardType) {
							var nums = [c1.params.num, c2.params.num, c3.params.num]
							nums.sort();

							if (num[2] == num[1] + 1 && num[1] == num[0] + 1) {
								validPick = true;
							}
						}
					} else if (this.selectedCards.length == 4) {
						var c1 = this.selectedCards[0];
						var c2 = this.selectedCards[1];
						var c3 = this.selectedCards[2];
						var c4 = this.selectedCards[3];

						var isFourCard = c1.params.num == c2.params.num && c2.params.num == c3.params.num && c3.params.num == c4.params.num;

						if (isFourCard)
							validPick = true;
						else if (c1.params.cardType == c2.params.cardType && c2.params.num == c3.params.cardType && c3.params.cardType == c4.params.cardType) {
							var nums = [c1.params.num, c2.params.num, c3.params.num, c4.params.num]
							nums.sort();

							if (num[3] == num[2] + 1 && num[2] == num[1] + 1 && num[1] == num[0] + 1) {
								validPick = true;
							}
						}

					} else if (this.selectedCards.length == 5) {
						var c1 = this.selectedCards[0];
						var c2 = this.selectedCards[1];
						var c3 = this.selectedCards[2];
						var c4 = this.selectedCards[3];
						var c4 = this.selectedCards[4];

						var isFiveCard = c1.params.num == c2.params.num && c2.params.num == c3.params.num && c3.params.num == c4.params.num && c4.params.num == c5.params.num;

						if (isFiveCard)
							validPick = true;
						else if (c1.params.cardType == c2.params.cardType && c2.params.num == c3.params.cardType && c3.params.cardType == c4.params.cardType && c4.params.cardType == c5.params.cardType) {
							var nums = [c1.params.num, c2.params.num, c3.params.num, c4.params.num, c5.params.num]
							nums.sort();

							if (num[4] == num[3] + 1 && num[3] == num[2] + 1 && num[2] == num[1] + 1 && num[1] == num[0] + 1) {
								validPick = true;
							}
						}
					}
				}

				// button throw enable or disable based on validPick
				if (validPick) {
					this.throwButton.inputEnabled = true;
					this.throwButton.alpha = 0;
				} else {
					this.throwButton.inputEnabled = false;
					this.throwButton.alpha = 0.75;
				}

			},
			dealGame: function () {

				players.forEach(function (player) {
					for (var i = 0; i < 5; i++) {
						//get the card from deck
						var card = deck[0];

						if (player.name != null) {
							player.hands = player.hands || [];
							player.hands.push(card);

							deck.splice(0, 1);
						}
					}
				}, this);

				//chice card 
				this.choice = deck[0];
				deck.splice(0, 1);

				this.isOnTurn = true;

			},
			throwCards: function () {
				console.log("throw card called");

				var n = 0;
				this.myHandCardsGroup.children.forEach(function (sprite) {
					if (sprite.params.selected) {
						console.log("selected card is " + sprite.params.name)
						players[0].hands.splice(n, 1);
						sprite.x = 100 + this.game.world.centerX + n * 10;
						sprite.y = 100 + n * 10;
						sprite.scale.setTo(0.30, 0.30);

						sprite.events.onInputUp.removeAll();
						sprite.events.onInputUp.add(function (_sprite) {
							this.game.world.moveUp(_sprite);
						}, this);

						sprite.input.enableDrag();
						sprite.events.onDragStart.add(function (_sprite) {
							console.log("dragging");
							this.game.world.moveUp(_sprite);
						}, this)

						n++;

						this.throwCardsGroup.add(sprite);
					}
				}, this)

				this.choiceCard.input.draggable = true;
				this.game.world.bringToTop(this.throwCardsGroup);
				socket.emit("new message", "Card throws");
			},

			callGame: function () {

			},
			checkCallGame: function () {

			},
			prepareDeckOnBackround: function () {
				for (var n = 0; n < 6; n++) {
					var card = this.game.add.sprite(150, 150, 'deck-back-floor');
					card.scale.setTo(0.5, 0.5);
					card.anchor.setTo(0.75, 1);
					card.angle = -(n - 75);
				}

				//this.deck = this.add.sprite(this.game.world.centerX - 50, this.game.world.centerY + 50, '');
			},
			prepareDeckAndShuffle: function () {


				// load number of decks
				deck = [];

				numberOfDeck = 2;
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
				//console.log(this.deck);
			},
			// General Arary Method
			removeItemFromArray: function (list, item) {
				for (var i = 0; i < list.length; i++) {
					if (list[i] == item) {
						list.splice(i, 1);
						break;
					}
				}
				return list;
			},
			addActionButtons: function () {

				// create a new bitmap data object
				var bmd = game.add.bitmapData(60, 20);

				// draw to the canvas context like normal
				bmd.ctx.beginPath();
				bmd.ctx.rect(0, 0, 60, 20);
				bmd.ctx.fillStyle = '#000';
				bmd.ctx.fill();

				//this.throwButton = new Phaser.Graphics(this.game, 200, this.game.world.height - 22);
				this.throwButton = this.game.add.sprite(200, this.game.world.height - 22, bmd);
				this.throwButton.alpha = 0.70;
				this.throwButton.inputEnabled = true;
				this.throwButton.input.pixelPerfectClick = true;
				this.throwButton.input.priorityID = 2;
				this.throwButton.events.onInputUp.add(this.throwCards, this);

				this.callButton = this.game.add.sprite(380, this.game.world.height - 22, bmd);
				this.callButton.alpha = 0.70;
				this.callButton.inputEnabled = true;
				this.callButton.input.useHandCursor = true;
				this.callButton.input.priorityID = 2;
				this.callButton.events.onInputUp.add(this.throwCards, this);

				this.allPlayersGroup.add(this.callButton);
				this.allPlayersGroup.add(this.throwButton);


			},
			positionPlayers: function () {

				//let's re-order the list of player and start positioning from bottom ceter;
				while (players[0].name != thisPlayer) {
					players.push(players[0]);
					players.splice(0, 1);
				}


				//this.background = this.game.add.sprite(0, 0, 'background');
				var _style = { font: "10px Arial", fill: "#fff" };
				var _style0 = { font: "14px Arial", fill: "#fff" };

				var pos_idx = 0;
				players.forEach(function (item) {
					var pos = player_positions[pos_idx];

					if (item.name != null) {
						var tempPlayer;
						var tempCircle;
						var desk;

						if (pos_idx == 0) {
							tempPlayer = this.allPlayersGroup.create(pos.x, pos.y, 'avatar', Math.floor(Math.random() * 41));
							tempPlayer.anchor.setTo(0.5, 0.25);
							tempPlayer.scale.setTo(1.55);


							desk = this.allPlayersGroup.create(pos.x, pos.y, 'desk');
							desk.anchor.setTo(0.5, 0.5);
							desk.scale.setTo(0.52);

							// Name and balance
							var name = game.add.text(pos.x - 115, pos.y - 11, item.name, _style0);
							//name.anchor.set(0);
							this.allPlayersGroup.add(name);

							var balance = game.add.text(pos.x + 80, pos.y - 11, item.balance, _style0);
							//balance.anchor.set(0);
							this.allPlayersGroup.add(balance);

						} else {
							tempPlayer = this.allPlayersGroup.create(pos.x, pos.y, 'avatar', Math.floor(Math.random() * 41));
							tempPlayer.anchor.setTo(0.5);

							tempCircle = this.allPlayersGroup.create(pos.x, pos.y, 'circle');
							tempCircle.anchor.setTo(0.5);
							tempCircle.scale.setTo(0.30);

							// Name and balance
							var name = game.add.text(pos.x, pos.y + 28, item.name, _style);
							name.anchor.set(0.5);
							this.allPlayersGroup.add(name);

							var balance = game.add.text(pos.x, pos.y - 26, "$" + item.balance, _style);
							balance.anchor.set(0.5);
							this.allPlayersGroup.add(balance);

							//other players card;
							var smallCard = this.allPlayersGroup.create(pos.x1, pos.y1, 'other-card');
							smallCard.anchor.set(0.5);
							smallCard.scale.setTo(0.30);

						}

					}
					else {
						//npPlayer = playersGroup.create(pos.x, pos.y, 'avatar_na')
						var naPlayer = this.game.add.sprite(pos.x, pos.y, 'avatar_na');
						naPlayer.anchor.setTo(0.5);
						naPlayer.scale.setTo(0.90);

						tempCircle = this.allPlayersGroup.create(pos.x, pos.y, 'circle');
						tempCircle.anchor.setTo(0.5);
						tempCircle.scale.setTo(0.30);
					}
					pos_idx++;
				}, this);

				this.game.world.bringToTop(this.allPlayersGroup);
			}
		}