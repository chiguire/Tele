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

var ScoreLayer = cc.Layer.extend({
    nameLayer: null,
    hiscoreLayer: null,
    initialsLabels: null,
    hiscoreList: null,
    continueButton: null,
    name: "AAA",
    score: 0,
    state: null, // "typename" || "hiscores"
    
    init:function () {
        var spr;
        var selfPointer = this;
        var lang = TV.LANG;
        var congratsspr, continuespr, hiscoresspr, scoresspr, sharespr, typenamespr, scoresspr;
        var colorItem, colorMenu;
        
        if (lang == "es") {
            congratsspr = s_scores_congrats_es;
            continuespr = s_scores_continue_es;
            hiscoresspr = s_scores_hiscores_es;
            sharespr = s_scores_share_es;
            scoresspr = s_scores_scores_es;
            typenamespr = s_scores_typename_es;
        } else {
            congratsspr = s_scores_congrats_en;
            continuespr = s_scores_continue_en;
            hiscoresspr = s_scores_hiscores_en;
            sharespr = s_scores_share_en;
            scoresspr = s_scores_scores_en;
            typenamespr = s_scores_typename_en;
        }
        
        
        this.parseDatafile();
        
        this.state = "typename";
        this.name = TV.NAME;
        this.score = TV.SCORE;
        
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
        
        this.nameLayer = cc.Layer.create();
        this.hiscoreLayer = cc.Layer.create();
        this.addChild(this.nameLayer);
        this.addChild(this.hiscoreLayer);
        
        this.createTV(10, size.height-160);
        
        spr = cc.Sprite.create(congratsspr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(400,648));
        this.addChild(spr);
        
        spr = cc.Sprite.create(scoresspr);
        spr.setAnchorPoint(new cc.Point(1, 0.5));
        spr.setPosition(new cc.Point(450,580));
        this.addChild(spr);
        
        spr = cc.LabelBMFont.create(""+TV.INFLUENCE+"%", s_fixedsysFont);
        spr.setAnchorPoint(new cc.Point(0, 0.5));
        spr.setPosition(new cc.Point(460, 595));
        this.addChild(spr);
        
        spr = cc.LabelBMFont.create(""+TV.SCORE, s_fixedsysFont);
        spr.setAnchorPoint(new cc.Point(0, 0.5));
        spr.setPosition(new cc.Point(460, 565));
        this.addChild(spr);
        
        spr = cc.Sprite.create(hiscoresspr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(size.width/2,525));
        this.hiscoreLayer.addChild(spr);
        
        this.hiscoreList = cc.LabelBMFont.create(this.getHiscoreString(), s_fixedsysFont);
        this.hiscoreList.setAnchorPoint(new cc.Point(0.5, 1));
        this.hiscoreList.setPosition(new cc.Point(size.width/2, 525-40));
        this.hiscoreLayer.addChild(this.hiscoreList);
        
        colorItem = cc.MenuItemImage.create(
            s_scores_continue_button,
            s_scores_continue_button_down,
            function () {
                selfPointer.continueHandler();
            },
            this);
        colorItem.scene = this;
        colorItem.setAnchorPoint(cc.p(0.5, 0.5));

        colorMenu = cc.Menu.create(colorItem);
        this.addChild(colorMenu);
        colorMenu.setPosition(cc.p(size.width/2, 60));
        
        this.continueButton = colorMenu;
        
        spr = cc.Sprite.create(continuespr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(size.width/2,60));
        this.addChild(spr);
        /*
        spr = cc.Sprite.create(sharespr);
        spr.setAnchorPoint(new cc.Point(1, 0.5));
        spr.setPosition(new cc.Point(388,137));
        this.hiscoreLayer.addChild(spr);
        */
        spr = cc.Sprite.create(typenamespr);
        spr.setAnchorPoint(new cc.Point(0.5, 0.5));
        spr.setPosition(new cc.Point(size.width/2,505));
        this.nameLayer.addChild(spr);
        
        this.initialsLabels = [];
        
        for (var i = 0; i != 3; i++) {
            var itemX = size.width/4*(i+1);
            colorItem = cc.MenuItemImage.create(
                s_scores_up,
                s_scores_up_down,
                this.createCallbackFunction("up", i),
                this);
            colorItem.scene = this;
            colorItem.setAnchorPoint(cc.p(0.5, 0.5));

            colorMenu = cc.Menu.create(colorItem);
            this.nameLayer.addChild(colorMenu);
            colorMenu.setPosition(cc.p(itemX, 720-310));
            
            spr = cc.LabelBMFont.create(this.getStringForNameIndex(i), s_nombresFont);
            spr.setAnchorPoint(new cc.Point(0.5, 0.5));
            spr.setPosition(cc.p(itemX, 720-410));
            this.initialsLabels.push(spr);
            this.nameLayer.addChild(spr);
            
            colorItem = cc.MenuItemImage.create(
                s_scores_down,
                s_scores_down_down,
                this.createCallbackFunction("down", i),
                this);
            colorItem.scene = this;
            colorItem.setAnchorPoint(cc.p(0.5, 0.5));

            colorMenu = cc.Menu.create(colorItem);
            this.nameLayer.addChild(colorMenu);
            colorMenu.setPosition(cc.p(itemX, 720-510));
        }
        
        if (TV.SCORE < TV.HISCORES[9].score) {
            this.setState("hiscores");
        } else {
            this.setState("typename");
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
    
    createCallbackFunction: function (direction, index) {
        if (direction == "up") {
            return function () {
                this.setPrevCharForNameIndex(index);
            }
        } else {
            return function () {
                this.setNextCharForNameIndex(index);
            }
        }
    },
    
    continueHandler: function () {
        if (this.state == "typename") {
            this.updateScores();
            this.setState("hiscores");
        } else if (this.state == "hiscores") {
            this.continueButton.setEnabled(false);
            var scene = cc.TransitionFade.create(1.2, new IntroScene(), cc.c3b(0,0,0));
            this.runAction(cc.Sequence.create(cc.DelayTime.create(0.5), 
                                              cc.CallFunc.create(function() {
                                                  cc.Director.getInstance().replaceScene(scene);
                                              })));
        }
    },
    
    setState: function (st) {
        if (st == "typename") {
            this.state = st;
            this.nameLayer.setVisible(true);
            this.hiscoreLayer.setVisible(false);
        } else if (st == "hiscores") {
            this.state = st;
            this.nameLayer.setVisible(false);
            this.hiscoreLayer.setVisible(true);
            this.hiscoreList.setString(this.getHiscoreString());
        }
    },
    
    getHiscoreString: function () {
        var s = "";
        
        for (var i = 0; i != TV.HISCORES.length; i++) {
            if (i < 9) {
                s += " " + (i+1) + ") "+TV.HISCORES[i].name+"....."+this.nformat(TV.HISCORES[i].score)+"\n";
            } else {
                s += "" + (i+1) + ") "+TV.HISCORES[i].name+"....."+this.nformat(TV.HISCORES[i].score)+"\n";
            }
        }
        
        return s;
    },
    
    getStringForNameIndex: function (index) {
        return this.name.substr(index,1); 
    },
    
    setNextCharForNameIndex: function (index) {
        var min = "A".charCodeAt(0);
        var max = "Z".charCodeAt(0);
        var n = this.name.charCodeAt(index);
        if (n == max) {
            n = min;
        } else {
            n++;
        }
        var oldname = this.name;
        this.name = "";
        for (var i = 0; i != 3; i++) {
            var letra;
            if (i == index) {
                letra = String.fromCharCode(n);
                
            } else {
                letra = oldname.substr(i, 1);
            }
            this.name += letra;
            this.initialsLabels[i].setString(letra);
        }
    },
    
    setPrevCharForNameIndex: function (index) {
        var min = "A".charCodeAt(0);
        var max = "Z".charCodeAt(0);
        var n = this.name.charCodeAt(index);
        if (n == min) {
            n = max;
        } else {
            n--;
        }
        var oldname = this.name;
        this.name = "";
        for (var i = 0; i != 3; i++) {
            var letra;
            if (i == index) {
                letra = String.fromCharCode(n);
                
            } else {
                letra = oldname.substr(i, 1);
            }
            this.name += letra;
            this.initialsLabels[i].setString(letra);
        }
    },
    
    updateScores: function () {
        TV.NAME = this.name;
        var newpos = undefined;
        
        for (var i = 0; i != TV.HISCORES.length; i++) {
            var ent = TV.HISCORES[i];
            if (ent.score <= TV.SCORE) {
                newpos = i;
                break;
            }
        }
        
        if (newpos) {
            var oldlist = TV.HISCORES;
            TV.HISCORES = oldlist.slice(0, newpos);
            TV.HISCORES.push({'name': TV.NAME, 'score': TV.SCORE});
            var secondlist = oldlist.slice(newpos).slice(0, 9-newpos);
            for (var i = 0; i != secondlist.length; i++) {
                TV.HISCORES.push(secondlist[i]);
            }
        }
        
        this.saveDatafile();
    },
    
    parseDatafile: function () {
        var ls = sys.localStorage;
        TV.NAME = ls.getItem('name') || "AAA";
        var hiscoresobj = JSON.parse(ls.getItem('hiscores'));
        TV.HISCORES = hiscoresobj? hiscoresobj.hiscoreslist: TV.DEFAULT_HISCORES;
    },
    
    saveDatafile: function () {
        var ls = sys.localStorage;
        ls.setItem('name', TV.NAME);
        ls.setItem('hiscores', JSON.stringify({'hiscoreslist': TV.HISCORES}));
    },
    
    nformat: function (num, len) {
        len = len || 6;
        var str = ''+num;
        while (str.length < len) {
            str = '0' + str;
        }
        return str;
    }
});

var ScoreScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new ScoreLayer();
        this.addChild(layer);
        layer.init();
    }
});