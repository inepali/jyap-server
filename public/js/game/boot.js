var bootState = {
	create: function () {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.state.start('loadState');
	}
};