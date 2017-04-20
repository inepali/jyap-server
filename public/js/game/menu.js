var menuState = {
	init: function () {
		// let's start socket communication so that we can talk

		players = [];

		player_positions = [
			{ x: this.game.world.width / 2, y: this.game.world.height - 35, x1: this.game.world.centerX + 30, y1: this.game.world.height - 70 },
			{ x: this.game.world.width - 35, y: this.game.world.height - 35, x1: this.game.world.width - 90, y1: this.game.world.height - 70 },
			{ x: this.game.world.width - 35, y: this.game.world.centerY, x1: this.game.world.width - 90, y1: this.game.world.centerY },
			{ x: this.game.world.width - 35, y: 35, x1: this.game.world.width - 90, y1: 70 },
			{ x: this.game.world.centerX, y: 35, x1: this.game.world.centerX, y1: 90 },
			{ x: 35, y: 35, x1: 90, y1: 70 },
			{ x: 35, y: this.game.world.centerY, x1: 90, y1: this.game.world.centerY },
			{ x: 35, y: this.game.world.height - 35, x1: 90, y1: this.game.world.height - 50 }
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
	createInput: function (x, y) {
		var bmd = this.add.bitmapData(300, 40);
		var myInput = this.game.add.sprite(x, y, bmd);

		myInput.canvasInput = new CanvasInput({
			canvas: bmd.canvas,
			fontSize: 24,
			fontFamily: 'Arial',
			fontColor: '#212121',
			fontWeight: 'bold',
			width: 300,
			readonly: false,
			padding: 8,
			borderWidth: 1,
			borderColor: '#000',
			borderRadius: 3,
			boxShadow: '1px 1px 0px #fff',
			innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
			placeHolder: 'Enter your name ...'
		});
		myInput.inputEnabled = true;
		myInput.input.useHandCursor = true;
		myInput.events.onInputUp.add(this.inputFocus, this);

		return myInput;
	},
	create: function () {
		background = this.game.add.sprite(0, 0, 'background');
		background.width = this.game.world.width;
		background.height = this.game.world.height;

		// this.nickname = this.createInput(this.game.world.centerX, 100);

		// //this.nickname = this.createInput(this.game.world.centerX, 50);
		// this.nickname.anchor.set(0.5);
		// //this.nickname.canvasInput.value("enter your name");

		// //this.nickname.inputEnabled = true;
		// //this.nickname.input.useHandCursor = true; 
		// //this.nickname.canvasInput.focus();   
		// //this.nickname.events.onInputUp.add(this.inputFocus, this);
		// this.nickname.canvasInput.onsubmit(function(data){
		// 	console.log("starting game");
		// 	thisPlayer = data.srcElement.value;
		// 	//players.push({name : thisPlayer, balance : 100});
		// 	Socket.start({name : thisPlayer, balance : 100});
		// 	//Socket.socket.emit("PLAYER_JOINED", {name : thisPlayer, balance : 100})
		// 	//game.state.start('gameState');
		}
};