var Jyap = Jyap || {};

Jyap.Card = function(game, x, y, key){
    Phaser.Sprite.call(this, game, x, y, key);

    this.anchor.setTo(0.5);
};


Jyap.Card.prototype = Object.create(Phaser.Sprite.prototype);
Jyap.Card.prototype.constructor = Jyap.Card;
