/* SOURCE: http://www.cocos2d-x.org/boards/19/topics/23698 */
var AnimatedSprite2 = cc.Node.extend({
    _sprite: null,
    _animationSequence: null,
    ctor: function (spriteNameStub, numFrames, speed, loopForever, shiftPositions) {
        var localThis = this;
        shiftPositions = shiftPositions || 0;
        
        this._sprite = cc.Sprite.createWithSpriteFrameName(spriteNameStub + this.pad(1, 3) + ".png");
        this.addChild(this._sprite);

        var animation = new cc.Animation.create();
        for (i = 1; i < numFrames+1; i++) {
            animation.addSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteNameStub + this.pad((i+shiftPositions)%numFrames, 3) + ".png"));
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
        //cc.log("animation complete " + TV.ISINCADENA);
        TV.ISINCADENA = false;
        //cc.log("animation complete " + TV.ISINCADENA);
    },
    playAnimation: function () {
        this._sprite.runAction(this._animationSequence);
    }
    
});