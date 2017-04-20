var Jyap = Jyap || {};

Jyap.Player = function(game, x, y, key){
    Phaser.Sprite.call(this, game, x, y, key);

    this.anchor.setTo(0.5);
};


Jyap.Player.prototype = Ojbect.create(Phaser.Sprite.prototype);
Jyap.Player.prototype.constructor = Jyap.Player;
