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

var IntroLayer = cc.Layer.extend({
    instructionsLabel:null,
    color1Array:null,
    selectedColor1:null,
    color2Array:null,
    selectedColor2:null,
    colorMenuItems:null,
    bothClicked: false,
    
    init:function () {
        var selfPointer = this;
        var lang = cc.Application.getCurrentLanguage() == cc.LANGUAGE_SPANISH? "es": "en";
        TV.LANG = lang;
        var click_spr;
        cc.log("Language: "+cc.Application.getCurrentLanguage()+" ENGLISH "+cc.LANGUAGE_ENGLISH+" SPANISH "+cc.LANGUAGE_SPANISH+" nav: "+navigator.language);
        if (lang == "en") {
            click_spr = s_intro_click_en;
        } else {
            click_spr = s_intro_click_es;
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
        
        var spr = cc.Sprite.create(s_intro_bg);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(cc.PointZero());
        this.addChild(spr);
        
        var clickspr = cc.Sprite.create(click_spr);
        clickspr.setAnchorPoint(cc.PointZero());
        clickspr.setPosition(cc.p(size.width + 10, 30));
        this.addChild(clickspr);
        this.instructionsLabel = clickspr;
        
        var textWidth = clickspr.getTextureRect().width;
        
        spr = cc.Sprite.create(s_scanlines);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(cc.PointZero());
        this.addChild(spr);
        
        spr = cc.Sprite.create(s_intro_title);
        spr.setAnchorPoint(cc.p(1, 1));
        spr.setPosition(cc.p(size.width - 10, size.height - 10));
        this.addChild(spr);
        
        //LANG BUTTON
        var esItem = cc.MenuItemImage.create(
            s_intro_lang_es,
            s_intro_lang_es,
            function () {
                TV.LANG = "en";
                this.langEsMenu.setVisible(false);
                this.langEnMenu.setVisible(true);
                this.instructionsLabel.initWithFile(s_intro_click_en);
            },
            this);
        esItem.setAnchorPoint(cc.p(0.5, 0.5));
        
        var enItem = cc.MenuItemImage.create(
            s_intro_lang_en,
            s_intro_lang_en,
            function () {
                TV.LANG = "es";
                this.langEsMenu.setVisible(true);
                this.langEnMenu.setVisible(false);
                this.instructionsLabel.initWithFile(s_intro_click_es);
            },
            this);
        enItem.setAnchorPoint(cc.p(0.5, 0.5));
        
        this.langEsMenu = cc.Menu.create(esItem);
        this.addChild(this.langEsMenu);
        this.langEsMenu.setPosition(cc.p(50, 220));
        this.langRect = esItem.rect();
        this.langRect.origin = cc.p(50-45, 220-45);
        this.langEsMenu.setVisible(TV.LANG == "es");
        
        this.langEnMenu = cc.Menu.create(enItem);
        this.addChild(this.langEnMenu);
        this.langEnMenu.setPosition(cc.p(50, 220));
        this.langEnMenu.setVisible(TV.LANG == "en");
        
        //SFX BUTTON
        var onItem = cc.MenuItemImage.create(
            s_intro_music_on,
            s_intro_music_on,
            function () {
                TV.SOUND = false;
                if (cc.AudioEngine.getInstance().isMusicPlaying()) {
                    cc.AudioEngine.getInstance().stopMusic();
                }
                this.sfxOnMenu.setVisible(false);
                this.sfxOffMenu.setVisible(true);
            },
            this);
        onItem.setAnchorPoint(cc.p(0.5, 0.5));
        
        var offItem = cc.MenuItemImage.create(
            s_intro_music_off,
            s_intro_music_off,
            function () {
                TV.SOUND = true;
                cc.AudioEngine.getInstance().playMusic(s_tvMusic, true);
                this.sfxOnMenu.setVisible(true);
                this.sfxOffMenu.setVisible(false);
            },
            this);
        offItem.setAnchorPoint(cc.p(0.5, 0.5));
        
        this.sfxOnMenu = cc.Menu.create(onItem);
        this.addChild(this.sfxOnMenu);
        this.sfxOnMenu.setPosition(cc.p(50, 120));
        this.sfxRect = onItem.rect();
        this.sfxRect.origin = cc.p(50-45, 120-45);
        this.sfxOnMenu.setVisible(TV.SOUND);
        
        this.sfxOffMenu = cc.Menu.create(offItem);
        this.addChild(this.sfxOffMenu);
        this.sfxOffMenu.setPosition(cc.p(50, 120));
        this.sfxOffMenu.setVisible(!TV.SOUND);
        
        var action = cc.RepeatForever.create(
            cc.Sequence.create(
                cc.Spawn.create(
                    cc.Blink.create(10, 15),
                    cc.MoveTo.create(10, cc.p(-textWidth - 10, 30))
                ),
                cc.CallFunc.create(function () {
                    clickspr.setPosition(cc.p(size.width + 10, 30));
                })
            )
        );
        
        clickspr.runAction(action);
        
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
        var p = new cc.Point(event.getLocation().x, event.getLocation().y);
        if (cc.Rect.CCRectContainsPoint(this.sfxRect, p) === false &&
            cc.Rect.CCRectContainsPoint(this.langRect, p) === false) {
            var scene = cc.TransitionFade.create(1.2, new SelectColorScene(), cc.c3b(0,0,0));
            cc.Director.getInstance().replaceScene(scene);
        }
    }
});

var IntroScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new IntroLayer();
        this.addChild(layer);
        layer.init();
    }
});