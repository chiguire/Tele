/* SOURCE: http://www.cocos2d-x.org/boards/19/topics/23698 */
var AnimatedSprite = cc.Node.extend({
    _sprite: null,
    _animationSequence: null,
    ctor: function (spriteNameStub, numFrames, speed, loopForever, shiftPositions) {
        var localThis = this;
        shiftPositions = shiftPositions || 0;
        
        this._sprite = cc.Sprite.createWithSpriteFrameName(spriteNameStub + this.pad(0, 2) + ".png");
        this.addChild(this._sprite);

        var animation = new cc.Animation.create();
        for (i = 0; i < numFrames; i++) {
            animation.addSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteNameStub + this.pad((i+shiftPositions)%numFrames, 2) + ".png"));
        }
        animation.setDelayPerUnit(speed/numFrames);

        var action = cc.Animate.create(animation);

        if (loopForever) {
            this._animationSequence = cc.RepeatForever.create(action);
        } else {
            this._animationSequence = cc.Sequence.create(action, cc.CallFunc.create(localThis.animationDone));
        }
    },
    pad: function (a, b) {
        return (1e15 + a + "").slice(-b);
    },
    animationDone: function (sender) {
        cc.log("animation complete " + sender);
    },
    playAnimation: function () {
        this._sprite.runAction(this._animationSequence);
    }
    
});