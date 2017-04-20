var cardTyes = [
			{ key: 'C', name: 'Club' },
			{ key: 'D', name: "Diamond" },
			{ key: 'H', name: "Heart" },
			{ key: 'S', name: "Spade" }];		
		
		var loadState = {
			init: function(){
				this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
				this.scale.pageAlignHorizontally = true;
				this.scale.pageAlignVertically = true;
				this.scale.forceLandscape = true;
			},
			preload: function(){
			var loadingLavel = this.game.add.text(100, this.game.world.centerX, 'loading ... ', {font: '30px Courier', fill : '#fff'});

				// Load Background
				this.load.image('background', 'assets/images/background.jpg');
				this.game.add.sprite(0, 0, 'background');
				this.load.image('circle', 'assets/images/circle.png');
				this.load.image('desk', 'assets/images/desk.png');
				this.load.image('other-card', 'assets/images/other-cards.png');

				// load card back
				this.load.image('deck-back', 'assets/images/card-back.png');
				this.load.image('deck-back-floor', 'assets/images/card-back-floor.png');

				//user action buttons
				//this.load.image('green-button', 'assets/images/green_button.png');
				//this.load.image('red-button', 'assets/images/red_button.png');
				this.load.image('button', 'assets/images/button.png');

				//user sprite
				this.load.spritesheet('avatar', 'assets/images/user_spritesheet.png', 50, 50, 41);
				this.load.image('avatar_na', 'assets/images/avatar.png');

				//load all cards
				cardTyes.forEach(function (item) {
					for (var j = 1; j <= 13; j++) {
						this.load.image(item.key + j, 'assets/images/cards/' + item.key + j + '.png');
					}
				}, this);

				//slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);

				//loading kenny UI data
				//slickUI.load('assets/ui/kenney/kenney.json');
			},
			create: function(){

				this.background = this.game.add.sprite(0, 0, 'background');
				this.background.width = this.game.world.width;
				this.background.height = this.game.world.height;

				this.game.state.start('menuState');
			}
		};