/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var SelectColorLayer = cc.Layer.extend({
    instructionsLabel:null,
    color1Array:null,
    selectedColor1:null,
    color2Array:null,
    selectedColor2:null,
    colorMenuItems:null,
    bothClicked: false,
    step1_text: null,
    step2_text: null,
    step3_text: null,
    num_step: 0,
    
    init:function () {
        var selfPointer = this;
        var lang = TV.LANG;
        var instructions_spr;
        if (lang == "en") {
            instructions_spr = s_instructions_text_en;
            this.step2_text = "Select color for the State";
            this.step1_text = "Select color for your party";
            this.step3_text = "Thank you. Please wait.";
        } else {
            instructions_spr = s_instructions_text_es;
            this.step2_text = "Escoge el color para el Estado";
            this.step1_text = "Escoge el color para tu partido";
            this.step3_text = "Gracias. Por favor espere.";
        }

        //////////////////////////////
        // 1. super init first
        this._super();
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_tv_white, s_tv_white_img);

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

        var colorLayer = cc.LayerColor.create(new cc.Color4B(115, 104, 131, 255));
        this.addChild(colorLayer);
        
        var colors = this.generateColors(6);
        this.shuffle(colors);
        
        this.color1Array = colors.slice(0, 3);
        this.color2Array = colors.slice(3);
        
        this.createTV(10, size.height-160);
        
        this.colorMenuItems = [];
        
        for (var i = 0; i != 6; i++) {
            var newi = i<3? i: i-3;
            var c = i<3? this.color1Array[i]: this.color2Array[i-3];
            var x = i<3? 640/3: 2*640/3;
            
            var colorSquare = cc.LayerColor.create(new cc.Color4B(c[0], c[1], c[2], 255), 92, 92);
            colorSquare.setAnchorPoint(cc.p(0, 0));
            colorSquare.setPosition(cc.p(x-92/2, 720-280-newi*150-92/2));
            this.addChild(colorSquare);
            
            var colorItem = cc.MenuItemImage.create(
                s_instructions_select_up,
                s_instructions_select_over,
                s_instructions_select_down,
                this.createCallbackFunction(i),
                this);
            colorItem.scene = this;
            colorItem.setAnchorPoint(cc.p(0.5, 0.5));
            
            var colorMenu = cc.Menu.create(colorItem);
            this.addChild(colorMenu);
            colorMenu.setPosition(cc.p(x, 720-280-newi*150));
            
            this.colorMenuItems.push(colorItem);
        }
        
        var spr = cc.Sprite.create(instructions_spr);
        spr.setAnchorPoint(cc.p(0.5, 0.5));
        spr.setPosition(cc.p(414, size.height-100));
        this.addChild(spr);
        
        this.instructionsLabel = cc.LabelBMFont.create(this.step1_text, s_fixedsysFont);
        this.instructionsLabel.setAnchorPoint(cc.p(0.5, 0.5));
        this.instructionsLabel.setPosition(cc.p(size.width/2, size.height-196));
        this.addChild(this.instructionsLabel);
        
        this.num_step = 0;
        
        if (TV.SOUND) {
            cc.AudioEngine.getInstance().playMusic(s_tvMusic, true);
        }
        
        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }
        if ('touches' in sys.capabilities) {
            this.setTouchEnabled(true);
        }
        
        //this.scheduleUpdate();
        this.adjustSizeForWindow();
        
        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForWindow();
        });
        return true;
    },

    adjustSizeForWindow: function () {
        var margin = document.documentElement.clientWidth - document.body.clientWidth;
        if (document.documentElement.clientWidth < cc.originalCanvasSize.width) {
            cc.canvas.width = cc.originalCanvasSize.width;
        } else {
            cc.canvas.width = document.documentElement.clientWidth - margin;
        }
        if (document.documentElement.clientHeight < cc.originalCanvasSize.height) {
            cc.canvas.height = cc.originalCanvasSize.height;
        } else {
            cc.canvas.height = document.documentElement.clientHeight - margin;
        }

        var xScale = cc.canvas.width / cc.originalCanvasSize.width;
        var yScale = cc.canvas.height / cc.originalCanvasSize.height;
        if (xScale > yScale) {
            xScale = yScale;
        }
        cc.canvas.width = cc.originalCanvasSize.width * xScale;
        cc.canvas.height = cc.originalCanvasSize.height * xScale;
        var parentDiv = document.getElementById("Cocos2dGameContainer");
        if (parentDiv) {
            parentDiv.style.width = cc.canvas.width + "px";
            parentDiv.style.height = cc.canvas.height + "px";
        }
        cc.renderContext.translate(0, cc.canvas.height);
        cc.renderContext.scale(xScale, xScale);
        cc.Director.getInstance().setContentScaleFactor(xScale);
    },
    
    /* MOUSE */
    onMouseUp: function (event) {
        this.processEvent(event);
    },
    
    /* TOUCHES */
    onTouchesEnded: function (touches, event) {
        this.processEvent(touches[0]);
    },
    
    processEvent: function (event) {
        
    },
    
    createTV: function (x, y) {
        var p = new cc.Point(x, y);
        var tv = cc.Sprite.create(s_tv);
        tv.setAnchorPoint(new cc.Point(0, 0));
        tv.setPosition(new cc.Point(p.x, p.y));
        this.addChild(tv);
        
        var tvw = new AnimatedSprite("white-tv", 16, 1.5, true, Math.floor(cc.RANDOM_0_1()*16));
        tvw.setAnchorPoint(new cc.Point(0, 0));
        tvw.setPosition(new cc.Point(8+53+p.x, 10+52+p.y));
        tvw.playAnimation();
        this.addChild(tvw);
        /*
        tvw = cc.Sprite.create(s_tv_mask);
        tvw.setAnchorPoint(new cc.Point(0, 0));
        tvw.setPosition(new cc.Point(14+p.x, 96+p.y));
        tvw.setOpacity(127);
        tvw.setColor(TV.TV_STATS[i*4+j]? TV.COLOR2: TV.COLOR1);
        tvw.nid = i*4+j;
        this.addChild(tvw);
        */
    },
    
    /* Generate a number of colors that do not resemble each other too much */
    generateColors: function (num) {
        var colors = [];
        
        var startingH = cc.RANDOM_0_1();
        var startingS = cc.RANDOM_0_1()*0.1+0.75;
        var startingV = 0.75;
        var deltaH = 1/num;
        var h = startingH;
        for (var i = 0; i != num; i++) {
            colors.push(this.hsvToRgb(h, startingS, startingV));
            h += deltaH;
            if (h > 1.0) h -= 1.0;
        }
        return colors;
    },
    
    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    hsvToRgb: function (h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch(i % 6){
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [r * 255, g * 255, b * 255];
    },
    
    shuffle: function (arr) {
        for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    },
    
    createCallbackFunction: function (index) {
        return function () {
            if (this.num_step == 0) {
                this.selectedColor2 = index<3? this.color1Array[index]: this.color2Array[index-3];
                TV.COLOR1 = cc.c3b(this.selectedColor2[0], this.selectedColor2[1], this.selectedColor2[2]);
                this.colorMenuItems[index].selected();
                this.colorMenuItems[index].setEnabled(false);
                this.instructionsLabel.setString(this.step2_text);
                this.num_step = 1;
            } else if (this.num_step == 1) {
                this.selectedColor1 = index<3? this.color1Array[index]: this.color2Array[index-3];
                TV.COLOR2 = cc.c3b(this.selectedColor1[0], this.selectedColor1[1], this.selectedColor1[2]);
                this.colorMenuItems[index].selected();
                this.colorMenuItems[index].setEnabled(false);
                this.instructionsLabel.setString(this.step3_text);
                this.checkBothComplete();
            }
        }
    },
    
    checkBothComplete: function () {
        var selfPointer = this;
        
        if (this.selectedColor1 && this.selectedColor2 && !this.bothClicked) {
            //console.log("Both complete");
            var action = cc.Sequence.create(
                cc.DelayTime.create(1.2),
                cc.CallFunc.create(selfPointer.transition)
            );
            this.runAction(action);
            this.bothClicked = true;
        }
    },
    
    transition: function () {
        if (TV.SOUND && cc.AudioEngine.getInstance().isMusicPlaying()) {
            cc.AudioEngine.getInstance().stopMusic();
        }
        var scene = cc.TransitionFade.create(1.2, new GameScene(), cc.c3b(0,0,0));
        cc.Director.getInstance().replaceScene(scene);
    }
});

var SelectColorScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new SelectColorLayer();
        this.addChild(layer);
        layer.init();
    }
});