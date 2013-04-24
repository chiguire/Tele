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

var GameLayer = cc.Layer.extend({
    televisions:null,
    televisions_display:null,
    cadena_display:null,
    timeLabel:null,
    scoreLabel:null,
    changeTimer:null,
    influenceMarker: null,
    isGameOver: false,
    gameOverSprite: null,
    stars_on: null,
    start_off: null,
    cursorSpr: null,

    init:function () {
        var spr;
        var selfPointer = this;
        var lang = TV.LANG;
        var influencespr = lang == "es"? s_ui_influence_es: s_ui_influence_en;
        var gameoverspr = lang == "es"? s_ui_gameover_es: s_ui_gameover_en;
        
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
        
        this.restart();
        
        this.televisions = [];
        this.televisions_display = [];
        this.cadena_display = [];
        
        this.tvLayer = cc.Layer.create();
        this.uiLayer = cc.Layer.create();
        
        this.addChild(this.tvLayer);
        this.addChild(this.uiLayer);
        
        this.uiLayer.setPosition(cc.p(0, 720-80));
        //this.tvLayer.setPosition(cc.p(0, -80));
        
        for (var i = 0; i != 4; i++) {
            for (var j = 0; j != 4; j++) {
                var p = new cc.Point(160*j, 160*3-160*i);
                var tv = cc.Sprite.create(s_tv);
                tv.setAnchorPoint(cc.PointZero());
                tv.setPosition(new cc.Point(6+p.x, -80+86+p.y));
                this.televisions.push(tv);
                this.tvLayer.addChild(tv);
                
                var tvw = new AnimatedSprite("white-tv", 16, 1.5, true, Math.floor(cc.RANDOM_0_1()*16));
                tvw.setAnchorPoint(cc.PointZero());
                tvw.setPosition(new cc.Point(14+53+p.x, -80+96+52+p.y));
                tvw.playAnimation();
                this.tvLayer.addChild(tvw);
                
                tvw = cc.Sprite.create(s_tv_mask);
                tvw.setAnchorPoint(cc.PointZero());
                tvw.setPosition(new cc.Point(14+p.x, -80+96+p.y));
                tvw.setOpacity(127);
                tvw.setColor(TV.TV_STATS[i*4+j]? TV.COLOR2: TV.COLOR1);
                tvw.nid = i*4+j;
                var nid = tvw.nid;
                this.tvLayer.addChild(tvw);
                this.televisions_display.push(tvw);
                
                tvw = new AnimatedSprite2("cadena_", 129, 2, false);
                tvw.setAnchorPoint(cc.PointZero());
                tvw.setPosition(new cc.Point(14+53+p.x, -80+96+52+p.y));
                tvw.setVisible(false);
                this.tvLayer.addChild(tvw);
                this.cadena_display.push(tvw);
                
                var lbl = cc.LabelBMFont.create(""+(nid+2), s_channelsFont);
                //var lbl = cc.LabelTTF.create(""+(nid+2), "Haettenschweiler", 24);
                lbl.setAnchorPoint(cc.PointZero());
                lbl.setPosition(new cc.Point(14+p.x+83, -80+96+p.y+80));
                //lbl.setColor(new cc.Color3B(0, 255, 0));
                lbl.setOpacity(210);
                this.tvLayer.addChild(lbl);
            }
        }
        
        spr = cc.LayerColor.create(new cc.c4b(0, 0, 0, 102), 640, 80);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(cc.PointZero());
        this.uiLayer.addChild(spr);
        
        //Score icon and label
        spr = cc.Sprite.create(s_ui_score);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(407, 42));
        this.uiLayer.addChild(spr);
        
        this.scoreLabel = cc.LabelBMFont.create(""+TV.SCORE, s_fixedsysFont);
        this.scoreLabel.setAnchorPoint(cc.PointZero());
        this.scoreLabel.setPosition(new cc.Point(407+32+15, 39));
        this.scoreLabel.setColor(new cc.c3b(255, 255, 255));
        this.uiLayer.addChild(this.scoreLabel);
        
        //Time icon and label
        spr = cc.Sprite.create(s_ui_clock);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(407, 5));
        this.uiLayer.addChild(spr);
        
        this.timeLabel = cc.LabelBMFont.create("00:"+TV.TIME, s_fixedsysFont);
        this.timeLabel.setAnchorPoint(cc.PointZero());
        this.timeLabel.setPosition(new cc.Point(407+32+15, 3));
        this.timeLabel.setColor(new cc.c3b(255, 255, 255));
        this.uiLayer.addChild(this.timeLabel);
        
        //Marker gradient bg
        spr = cc.LayerGradient.create(new cc.c4b(TV.COLOR2.r, TV.COLOR2.g, TV.COLOR2.b, 255), 
                                      new cc.c4b(TV.COLOR1.r, TV.COLOR1.g, TV.COLOR1.b, 255),
                                      new cc.Point(1, 0));
        spr.changeWidthAndHeight(320, 64);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(43, 10));
        this.uiLayer.addChild(spr);
        
        spr = cc.Sprite.create(influencespr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(43+320/2, 10+64/2));
        spr.setOpacity(127);
        this.uiLayer.addChild(spr);
        
        //Marker background
        spr = cc.Sprite.create(s_ui_marker_bg);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(43, 10));
        this.uiLayer.addChild(spr);
        
        //State color
        spr = cc.LayerColor.create(new cc.c4b(TV.COLOR2.r, TV.COLOR2.g, TV.COLOR2.b, 255), 32, 32);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(8, 27));
        this.uiLayer.addChild(spr);
        
        //Party color
        spr = cc.LayerColor.create(new cc.c4b(TV.COLOR1.r, TV.COLOR1.g, TV.COLOR1.b, 255), 32, 32);
        spr.setAnchorPoint(cc.PointZero());
        spr.setPosition(new cc.Point(366, 27));
        this.uiLayer.addChild(spr);
        
        //Influence marker pointer
        this.influenceMarker = cc.Sprite.create(s_ui_marker_pointer);
        this.influenceMarker.setAnchorPoint(new cc.Point(0.5, 0));
        this.influenceMarker.setPosition(this.getInfluenceMarkerPosition());
        this.uiLayer.addChild(this.influenceMarker);
        
        this.gameOverSprite = cc.LayerColor.create(new cc.c4b(0, 0, 0, 102));
        this.gameOverSprite.setAnchorPoint(cc.PointZero());
        this.gameOverSprite.setPosition(cc.PointZero());
        this.addChild(this.gameOverSprite);
        this.gameOverSprite.setVisible(false);
        
        spr = cc.Sprite.create(gameoverspr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(this.gameOverSprite.getContentSize().width/2, this.gameOverSprite.getContentSize().height/2));
        this.gameOverSprite.addChild(spr);
        
        spr = cc.Sprite.create(s_ui_cursor);
        spr.setAnchorPoint(new cc.Point(0.25, 1));
        spr.setPosition(cc.PointZero());
        this.addChild(spr);
        spr.setVisible(false);
        this.cursorSpr = spr;
        
        if (TV.SOUND) {
            cc.AudioEngine.getInstance().playMusic(s_bgMusic, true);
        }
        
        if ('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
            this.cursorSpr.setVisible(true);
        }
        if ('touches' in sys.capabilities) {
            this.setTouchEnabled(true);
        }
        
        this.scheduleUpdate();
        
        this.adjustSizeForWindow();
        this.schedule(this.timeCounter, 1);
        this.schedule(this.influenceCounter, 0.5);
        
        window.addEventListener("resize", function (event) {
            selfPointer.adjustSizeForWindow();
        })
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
    
    restart: function () {
        TV.TIME = TV.START_TIME;
        this.changeTimer = 0;
        
        for (var i = 0; i != 16; i++) {
            TV.TV_STATS[i] = cc.RANDOM_0_1() < 0.5;
        }
        TV.ISINCADENA = false;
        TV.SCORE = 0;
        TV.STARS = 0;
        TV.INFLUENCE = 0;
        TV.INFLUENCE_SPEED = 0;
        TV.INFLUENCE_ACCEL = 0;
        
        this.isGameOver = false;
        
        TV.CADENA_TIMES = []
        var times = Math.ceil(2+cc.RANDOM_0_1()*2);
        for (var i = 0; i != times; i++) {
            TV.CADENA_TIMES.push(Math.floor(cc.RANDOM_MINUS1_1()*5+10+(TV.START_TIME-20)*i/times));
        }
        //cc.log("Cadena times are ["+TV.CADENA_TIMES+"]");
    },
    
    update:function (dt) {
        //State changes TVs
        if (TV.TIME > 0 && !TV.ISINCADENA) {
        
            if (this.inCadena) {
                for (var i = 0; i != 16; i++) {
                    this.cadena_display[i].setVisible(false);
                }
                this.inCadena = false;
            }
            
            this.changeTimer++;
            var numColor2 = 0;
            for (var i = 0; i != 16; i++) {
                if (TV.TV_STATS[i]) numColor2++;
            }
            if (this.changeTimer >= 200-((16-numColor2)*195/16)) {
                this.changeTimer = 0;
                var availableIndexes = [];
                for (var i = 0; i != 16; i++) {
                    if (!TV.TV_STATS[i]) availableIndexes.push(i);
                }
                if (availableIndexes.length == 0) return;
                var times = 1;
                if (availableIndexes.length > 10) times = 4;
                else if (availableIndexes.length > 5) times = 2;
                for (var t = 0; t < times; t++) {
                    var leTv = availableIndexes[Math.floor(cc.RANDOM_0_1()*availableIndexes.length)];
                    if (!TV.TV_STATS[leTv]) {
                        TV.TV_STATS[leTv] = true;
                        var tvw = this.televisions_display[leTv];
                        tvw.setColor(TV.COLOR2);
                        
                    }
                }
                if (TV.SOUND) {
                    var sfx = cc.AudioEngine.getInstance().playEffect(s_changeTo2Effect);
                }
            }
        } else if (TV.ISINCADENA) {
            this.inCadena = true;
        }
    },
    
    /* MOUSE */
    onMouseUp: function (event) {
        this.processEvent(event);
    },
    
    onMouseMoved: function (event) {
        this.cursorSpr.setPosition(new cc.Point(event.getLocation().x, event.getLocation().y));
    },
    
    /* TOUCHES */
    onTouchesEnded: function (touches, event) {
        this.processEvent(touches[0]);
    },
    
    processEvent: function (event) {
        if (TV.ISINCADENA) return;
        if (TV.TIME <= 0) return;
        
        var nid = -1;
        var tvw = null;
        var size = cc.Director.getInstance().getWinSize();
        var p = new cc.Point(event.getLocation().x, event.getLocation().y);
        for (var i = 0; i != 16; i++) {
            var o = this.televisions_display[i];
            if (cc.Rect.CCRectContainsPoint(o.getBoundingBox(), p) === true) {
                //console.log("Click on ("+p.x+", "+p.y+"), nid: "+o.nid);
                nid = o.nid;
                tvw = o;
                break;
            }
        }
        if (nid != -1 && TV.TV_STATS[nid]) {
            TV.TV_STATS[nid] = false;
            tvw.setColor(TV.COLOR1);
            if (TV.SOUND) {
                var sfx = cc.AudioEngine.getInstance().playEffect(s_changeTo1Effect);
            }
        }
    },
    
    timeCounter: function () {
        if (TV.ISINCADENA) return;
        if (TV.TIME > 0) {
            TV.TIME--;
            for (var i = 0; i != TV.CADENA_TIMES.length; i++ ){
                if (TV.TIME == TV.CADENA_TIMES[i]) {
                    this.activateCadena();
                    break;
                }
            }
        } else if (!this.isGameOver) {
            this.gameOverSprite.setVisible(true);
            var scene = cc.TransitionFade.create(1.2, new ScoreScene(), cc.c3b(0,0,0));
            this.runAction(cc.Sequence.create(cc.DelayTime.create(5), 
                                              cc.CallFunc.create(function() {
                                                  if (TV.SOUND && cc.AudioEngine.getInstance().isMusicPlaying()) {
                                                      cc.AudioEngine.getInstance().stopMusic();
                                                  }
                                                  cc.Director.getInstance().replaceScene(scene);
                                              })));
            this.isGameOver = true;
        }
        if (TV.TIME >= 10) {
            this.timeLabel.setString("00:"+TV.TIME);
        } else {
            this.timeLabel.setString("00:0"+TV.TIME);
        }
    },
    
    influenceCounter: function () {
        if (TV.TIME == 0) return;
        
        //Influence counter
        var numTvs = 0;
        for (var i = 0; i != 16; i++) {
            if (!TV.TV_STATS[i]) numTvs++;
        }
        numTvs -= 8;
        if (TV.ISINCADENA) {
            //TV.INFLUENCE = Math.max(0, Math.min(100, TV.INFLUENCE + -1.5/8*8));
            return;
        } else {
            TV.INFLUENCE_ACCEL = Math.max(-2, Math.min(2, numTvs/8*2));
        }
        //console.log("Current influence is "+TV.INFLUENCE);
        TV.INFLUENCE_SPEED = Math.max(-3, Math.min( 4, TV.INFLUENCE_SPEED + TV.INFLUENCE_ACCEL));
        TV.INFLUENCE = Math.max(0, Math.min(100, TV.INFLUENCE + TV.INFLUENCE_SPEED));
        
        this.influenceMarker.runAction(cc.MoveTo.create(0.5, this.getInfluenceMarkerPosition()));
        
        TV.SCORE += Math.floor(TV.INFLUENCE*100);
        this.scoreLabel.setString(TV.SCORE);
    },
    
    activateCadena: function () {
        var selfPointer = this;
        
        for (var i = 0; i != 16; i++) {
            this.cadena_display[i].setVisible(true);
            this.cadena_display[i].playAnimation();
            TV.TV_STATS[i] = true;
            var tvw = this.televisions_display[i];
            tvw.setColor(TV.COLOR2);
        }
        TV.ISINCADENA = true;
        
        if (TV.SOUND) {
            var sfx = cc.AudioEngine.getInstance().playEffect(s_cadenaEffect);
        }
    },
    
    getInfluenceMarkerPosition: function () {
        return new cc.Point(44+TV.INFLUENCE/100*317, 6);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
        layer.init();
    }
});