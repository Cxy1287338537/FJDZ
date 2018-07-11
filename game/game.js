// 游戏采取闭包形式， 向外暴露中介者Game类实例

(function () {

  // Actor类： 游戏中的每一个需要绘制在画布上的对象，视作一个actor
  // Actor拥有共同的属性，通过继承，再衍生出自己的属性
  class Actor {

    // Actor类构造函数，继承时，会调用自身的init函数
    constructor (...args) {
      this.init(...args);
      this['z-index'] = 0;
      // 将actor实例添加到中介者$game的actors数组中
      $game.actors.add(this);
    }

    init () {

    }
    // 回收对象
    delete () {
      $game.actors.remove(this);
    }
    // 判断是否点击到该对象
    // e为触碰时的起始坐标
    // 判断的依据是：
    // 触碰点x坐标不小于actor的left属性 且
    // 触碰点x坐标不大于actor的left属性加宽度 且
    // 触碰点y坐标不小于actor的top属性 且
    // 触碰点y坐标不大于actor的top属性加高度 
    filterClick (e) {
      if(e.x < this.left) return false;
      if(e.x > this.left+this.size.width) return false;
      if(e.y < this.top) return false;
      if(e.y > this.top+this.size.height) return false;
      return true;
    }
    // 判断触碰点是否在该对象松开
    // e为触碰点的最后一次坐标
    // 判断的依据是：
    // 触碰点x坐标不小于actor的left属性 且
    // 触碰点x坐标不大于actor的left属性加宽度 且
    // 触碰点y坐标不小于actor的top属性 且
    // 触碰点y坐标不大于actor的top属性加高度 
    filterEnd (e) {
      if(e.x < this.left) return false;
      if(e.x > this.left+this.size.width) return false;
      if(e.y < this.top) return false;
      if(e.y > this.top+this.size.height) return false;
      return true;
    }
    filterMove(e) {
      if(e.x < this.left) return false;
      if(e.x > this.left+this.size.width) return false;
      if(e.y < this.top) return false;
      if(e.y > this.top+this.size.height) return false;
      return true;
    }
  }

  class Button extends Actor {
    init () {
      this.img = $game.$assets.btn_bg;
      this.size = {
        width: this.img.width,
        height: this.img.height
      };
      this.isActive = false;
      this.button();
    }

    render () {
      if(this.showFilter&&this.showFilter() === false) return ;
      if(this._status !== undefined&& $game.status !== this._status) {
        this.delete();
        return ;
      }
      $game.ctx.drawImage(this.img, 0, this.isActive?this.size.height/2:0, this.img.width, this.img.height/2, this.left, this.top, this.img.width, this.img.height/2);
      if(this.text) {
        this.drawText();
      }
    }

    clickBefore () {
      this.isActive = true;
    }

    clickAfter () {
      this.isActive = false;
    }

    drawText () {
      var l = this.left + (this.size.width - this.text.size.width)/2;
      var t = this.top + (this.size.height/2 - this.text.size.height)/2;
      $game.ctx.drawImage(this.text.img, l, t, this.text.size.width, this.text.size.height);
    }
  }

  class UFO extends Actor {
    init (...args) {
      this.UFO(...args);
    }
  }

  class Background extends Actor {
    init () {
      this.img = $game.$assets.background;
      this.size = $game.conversion(this.img);
      this.top = 0;
    }
    update () {
      if($game.status !== 2) {
        this.top += $game.speed;
        if(this.top >= this.size.height) {
          this.top = 0;
        }
      }
    }
    render () {
      $game.ctx.drawImage(this.img,0,this.top,this.size.width,this.size.height);
      $game.ctx.drawImage(this.img,0,this.top - this.size.height,this.size.width,this.size.height);
    }
  }

  class Logo extends Actor {
    init () {
      this.img = $game.$assets.logo;
      this.size = $game.conversion(this.img);
    }
    render () {
      var l = ($game.canvas.width - this.size.width)/2;
      var t = $game.canvas.height*(1 - 0.618);
      if($game.status === 0) {
        $game.ctx.drawImage(this.img,l,t,this.size.width,this.size.height);
      }
      else {
        this.delete();
      }
    }
  }

  class StartButton extends Button {
    button () {
      this.left = ($game.canvas.width - this.size.width)/2;
      this.top = $game.canvas.height*0.618;
      this.text = {
        img: $game.$assets.start,
        size: $game.conversion($game.$assets.start)
      }
      this._status = 0;
    }

    onend () {
      $game.status = 1;
    }
  }

  class PauseButton extends Actor {
    init () {
      this.img = $game.$assets.btn_pause;
      this.size = $game.conversion(this.img);
      this.left = 5;
      this.top = 5;
      this['z-index'] = 10;
    }

    render() {
      if($game.status === 1) {
        $game.ctx.drawImage(this.img, this.left, this.top, this.size.width, this.size.height);
      }
    }

    onend () {
      $game.status = 2;
      return false;
    }
  }

  class RestartButton extends Button {
    button () {
      this.left = ($game.canvas.width - this.size.width)/2;
      this.top = $game.canvas.height*0.618;
      this.text = {
        img: $game.$assets.restart,
        size: $game.conversion($game.$assets.restart)
      }
    }

    showFilter () {
      return $game.status === 3;
    }

    onend () {
      if(this.showFilter() === false) return ;
      $game.restart();
    }
  }


  class PauseBg extends Actor {
    init () {
      this.img = $game.$assets.gamePause;
      this.size = $game.conversion(this.img);
      this.left = ($game.canvas.width - this.size.width)/2;
      this.top = ($game.canvas.height - this.size.height)/2;
      this['z-index'] = 10;
    }
    render () {
      if($game.status===2) {
        $game.ctx.drawImage(this.img, this.left, this.top, this.size.width, this.size.height);
      }
    }
    filterEnd () {
      return $game.status === 2;
    }
    onend () {
      $game.status = 1;
    }
  }

  class OverBg extends Actor {
    init () {
      this.img = $game.$assets.gameOver;
      this.size = $game.conversion(this.img);
      this.left = ($game.canvas.width - this.size.width)/2;
      this.top = ($game.canvas.height - this.size.height)/2;
      this['z-index'] = 10;
    }
    render () {
      if($game.status===3) {
        $game.ctx.drawImage(this.img, this.left, this.top, this.size.width, this.size.height);
      }
    }
  }

  class Bullet extends Actor {
    init (opt = {}) {
      this.img = $game.$assets['bullet'+(opt.type || 2)];
      this.size = $game.conversion(this.img);
      this.left = opt.left - this.size.width/2;
      this.top = opt.top - this.size.height;
      this.speed = 3;
      this['z-index'] = -1;
    }

    render () {
      $game.ctx.drawImage(this.img,this.left,this.top,this.size.width,this.size.height);
    }

    update () {
      if($game.status === 1 || $game.status === 3) {
        this.top -= this.speed;
        if(this.top + this.size.height <= 0) this.delete();
      }
    }
  }

  class Enemy extends Actor {
    init (opt) {
      switch (opt.type) {
        case 2: 
          this.imgs = {
            normal: $game.$assets.enemy2_fly1,
            hit: $game.$assets.enemy2_hit,
            down1: $game.$assets.enemy2_down1,
            down2: $game.$assets.enemy2_down2,
            down3: $game.$assets.enemy2_down3,
            down4: $game.$assets.enemy2_down4
          }
          this.speed = 2;
          this.blood = 5;
          this.dieLong = 4;
          this.score = 1200;
          break;
        case 3:
          this.imgs = {
            normal: $game.$assets.enemy3_fly1,
            normal2: $game.$assets.enemy3_fly2,
            hit: $game.$assets.enemy3_hit,
            down1: $game.$assets.enemy3_down1,
            down2: $game.$assets.enemy3_down2,
            down3: $game.$assets.enemy3_down3,
            down4: $game.$assets.enemy3_down4,
            down5: $game.$assets.enemy3_down5,
            down6: $game.$assets.enemy3_down6
          }
          this.speed = 1.5;
          this.blood = 12;
          this.dieLong = 6;
          this.score = 3000;
          this.canFly = true;
          this.canEmit = true;
          break;
        default:
          this.imgs = {
            normal: $game.$assets.enemy1_fly1,
            down1: $game.$assets.enemy1_down1,
            down2: $game.$assets.enemy1_down2,
            down3: $game.$assets.enemy1_down3,
            down4: $game.$assets.enemy1_down4
          }
          this.speed = 3;
          this.blood = 1;
          this.dieLong = 4;
          this.score = 100;
          break;
      }
      this.img = this.imgs.normal;
      this.size = $game.conversion(this.img);
      if(opt.left) {
        this.left = opt.left - this.size.width/2;
      }
      else {
        this.left = Math.round(Math.random()*($game.canvas.width - this.size.width));
      }
      if(opt.top) {
        this.top = opt.top - this.size.height/2;
      }
      else {
        this.top = -this.size.height;
      }
      this.status = 0;
    }

    update () {
      if($game.status === 1 || $game.status === 3) {
        this.checkBullet();
        if(this.checkEat()) {
          $game.hero.die();
        }
        if(this.status === 0 || this.status === -1) {
          this.top += this.speed;
          if(this.top >= $game.canvas.height) {
            this.delete();
          }
          this.fly();
        }
        else if(this.status <= this.dieLong) {
          this.img = this.imgs['down'+this.status];
          this.status++;
        }
        else {
          this.delete();
          $game.score += this.score;
        }

        if(this.status === -1) {
          this.img = this.imgs.hit;
          this.status = 0;
        }

        if($game.frame%200 === 0) {
          this.emit();
        }
      }
    }

    render () {
      $game.ctx.drawImage(this.img, this.left, this.top, this.size.width, this.size.height);
    }

    checkBullet () {
      for(var v of $game.actors) {
        if(! (v instanceof Bullet) ) continue;
        if(v.left + v.size.width/2 < this.left) continue;
        if(v.left + v.size.width/2 > this.left+this.size.width) continue;
        if(v.top > this.top + this.size.height) continue;
        if(v.top + v.size.height < this.top) continue;
        v.delete();
        this.blood--;
        if(this.blood <= 0) {
          this.die();
        }
        else {
          this.status = -1;
        }
      }
    }

    die () {
      this.status = 1;
    }

    fly () {
      if(this.canFly) {
        if(this.img === this.imgs.normal) {
          this.img = this.imgs.normal2;
        }
        else {
          this.img = this.imgs.normal;
        }
      }
      else {
        this.img = this.imgs.normal;
      }
    }

    emit () {
      if(this.canEmit !== true) return ;
      var size1 = $game.conversion({width:85,height:172});
      var size2 = $game.conversion({width:39,height:172});
      new Enemy({
        type: 1,
        left: this.left + size1.width,
        top: this.top + size1.height
      });
      new Enemy({
        type: 1,
        left: this.left + size2.width,
        top: this.top + size2.height
      });
      new Enemy({
        type: 1,
        left: this.left + this.size.width - size2.width,
        top: this.top + size2.height
      });
    }

    checkEat () {
      var v = $game.hero;
      if(v.status !== 0) return ;
      if(v.left + v.size.width - 1/4*v.size.width < this.left) return false;
      if(v.left - 1/4*v.size.width > this.left+this.size.width) return false;
      if(v.top > this.top + this.size.height) return false;
      if(v.top + v.size.height < this.top) return false;
      return true;
    }
  }

  class Buff extends UFO {
    UFO (opt = {}) {
      this.img = $game.$assets.ufo1;
      this.size = $game.conversion(this.img);
      this.speed = opt.speed || 3;
      this.time = opt.time || 30;
      this.left = Math.round(Math.random()*($game.canvas.width - this.size.width));
      this.top = -this.size.height;
    }

    update () {
      if($game.status === 1 || $game.status === 3) {
        if(this.checkEat()) {
          this.delete();
          this.buff();
        } else {
          this.top += this.speed;
          if(this.top >= $game.canvas.height) this.delete();
        }
      }
    }

    render () {
      $game.ctx.drawImage(this.img,this.left,this.top,this.size.width,this.size.height);
    }

    checkEat () {
      var v = $game.hero;
      if(v.left + v.size.width < this.left) return false;
      if(v.left > this.left+this.size.width) return false;
      if(v.top > this.top + this.size.height) return false;
      if(v.top + v.size.height < this.top) return false;
      return true;
    }

    buff () {
      $game.hero.gunSwitch1 = false;
      $game.hero.gunSwitch2 = true;
      $game.hero.gun2Time += this.time*40;
    }
  }

  class Boom extends UFO {
    UFO (opt = {}) {
      this.img = $game.$assets.ufo2;
      this.size = $game.conversion(this.img);
      this.speed = opt.speed || 3;
      this.left = Math.round(Math.random()*($game.canvas.width - this.size.width));
      this.top = -this.size.height;
    }

    update () {
      if($game.status === 1 || $game.status === 3) {
        if(this.checkEat()) {
          this.delete();
          this.buff();
        } else {
          this.top += this.speed;
          if(this.top >= $game.canvas.height) this.delete();
        }
      }
    }

    render () {
      $game.ctx.drawImage(this.img,this.left,this.top,this.size.width,this.size.height);
    }

    checkEat () {
      var v = $game.hero;
      if(v.left + v.size.width< this.left) return false;
      if(v.left > this.left+this.size.width) return false;
      if(v.top > this.top + this.size.height) return false;
      if(v.top + v.size.height < this.top) return false;
      return true;
    }

    buff () {
      $game.boom++;
    }
  }

  class Hero extends Actor {
    init () {
      this.imgs = {
        normal1: $game.$assets.hero_fly1,
        normal2: $game.$assets.hero_fly2,
        down1: $game.$assets.hero_down1,
        down2: $game.$assets.hero_down2,
        down3: $game.$assets.hero_down3,
        down4: $game.$assets.hero_down4
      }
      this.img = this.imgs.normal1;
      this.size = $game.conversion(this.imgs.normal1);
      // 机身状态：-1预登场, 0飞行1, 1飞行2，2死亡
      this.status = -2;
      this.left = ($game.canvas.width - this.size.width)/2;
      this.top = $game.canvas.height;
      // 枪口开关
      this.gunSwitch1 = true;
      this.gunSwitch2 = false;
      this.gun2Time = 0;
      // 枪速度
      this.speed = 0.3;
      this.dieLong = 4;
    }

    fly () {
      if(this.img === this.imgs.normal2) {
        this.img = this.imgs.normal1;
      }
      else {
        this.img = this.imgs.normal2;
      }
    }

    render () {
      if($game.status !== 0) {
        $game.ctx.drawImage(this.img, this.left, this.top, this.size.width, this.size.height);
      }
    }

    update () {
      if ($game.status === 0) return ;
      if ($game.status === 1) {
        if($game.frame%20===0&&this.status < 1) this.fly();
        if($game.frame%(this.speed*40) === 0&&this.status===0) {
          this.gun1();
          this.gun2();
        }
        if(this.status === -2) {
          this.top -= 10;
          if(this.top <= $game.canvas.height/2) {
            this.status = -1;
          }
        }
        else if(this.status === -1) {
          this.top += 4;
          if(this.top >= $game.canvas.height - 50 - this.size.height) {
            this.status = 0;
          }
        }
        else if(this.status === 0) {
          if(this.gun2Time > 0) {
            this.gun2Time--;
            if(this.gun2Time === 0) {
              this.gunSwitch2 = false;
              this.gunSwitch1 = true;
            }
          }
        }
        else if(this.status>=1&&this.status<=this.dieLong) {
          this.img = this.imgs['down'+this.status];
          this.status++;
        }
        else if(this.status > this.dieLong) {
          this.delete();
          $game.over();
        }
      }
    }

    onmove (e) {
      if($game.status === 1 && this.status === 0) {
        this.left += e.computed.x;
        this.top += e.computed.y;
        var mx = $game.canvas.width - this.size.width;
        var my = $game.canvas.height - this.size.height;
        if(this.left < 0) this.left = 0;
        if(this.left > mx) this.left = mx;
        if(this.top < 0) this.top = 0;
        if(this.top > my) this.top = my;
      }
    }

    gun1 () {
      if(this.gunSwitch1 === true) {
        this.speed = 0.3;
        new Bullet({
          type: 2,
          left: this.left+this.size.width/2,
          top: this.top
        });
      }
    }

    gun2 () {
      if(this.gunSwitch2 === true) {
        var size = $game.conversion({width: 17, height: 44});
        this.speed = 0.2;
        new Bullet({
          type: 1,
          left: this.left + size.width,
          top: this.top + size.height,
          speed: 2
        });
        new Bullet({
          type: 1,
          left: this.left + this.size.width - size.width,
          top: this.top + size.height,
          speed: 2
        });
      }
    }

    die () {
      this.status = 1;
    }
  }

  class BoomBtn extends Actor {
    init () {
      this.img = $game.$assets.ufo_boom;
      this.size = {
        width: this.img.width,
        height: this.img.height
      }
      this.left = 5;
      this.top = $game.canvas.height - this.size.height - 5;
    }

    render () {
      if($game.status !== 0) {
        $game.ctx.drawImage(this.img, this.left,this.top,this.size.width,this.size.height);
        $game.ctx.textBaseline = 'middle';
        $game.ctx.textAlign = 'left';
        $game.ctx.font = '24px consolas'; 
        $game.ctx.fillText(`${$game.boom}`, this.left+this.size.width+5, this.top + this.size.height/2);
      }
    }

    onend () {
      if($game.status !== 1) return ;
      if($game.boom <= 0) return ;
      $game.boom--;
      $game.stopEnemy = 80;
      for(var v of $game.actors) {
        if(v instanceof Enemy) v.die();
      }
    }
  }

  class Game {
    constructor (canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.actors = [];
      this.speed = 1;
      this.actors.sort = function () {
        for(var i=0;i<this.length;i++){
          for(var j=0;j<this.length - 1 -i;j++) {
            if(this[j]['z-index'] > this[j+1]['z-index']) {
              var tmp = this[j];
              this[j] = this[j+1];
              this[j+1] = tmp;
            }
          }
        }
      }
      this.actors.add = function (n) {
        this.push(n);
        this.sort();
      }
      this.actors.remove = function (n) {
        var p = this.indexOf(n);
        if(p !== -1) {
          this.splice(p, 1);
          this.sort();
        }
      }
      this.loadImage();
    }

    loadImage () {
      var node = this;
      var xml = new XMLHttpRequest();
      var cx = node.canvas.width/2, cy = node.canvas.height/2;
      node.ctx.textAlign = 'center';
      node.ctx.fillStyle = 'white';
      node.ctx.font = '18px Arial bold';
      node.ctx.fillText('正在加载资源...',cx,cy);
      xml.open('get','assets.json',true);
      xml.send(null);
      xml.onreadystatechange = function () {
        if(xml.readyState === 4 && xml.status === 200) {
          var data = JSON.parse(xml.responseText);
          node.assets = data;
          node.$assets = {};
          var now = 0, all = Object.keys(data).length;
          node.ctx.clearRect(0,0,node.canvas.width, node.canvas.height);
          node.ctx.fillText(`正在加载资源 ${now}/${all}`,cx,cy);
          for(var k in data) {
            var img = new Image();
            img.src = data[k];
            img.onload = function () {
              now++;
              node.ctx.clearRect(0,0,node.canvas.width, node.canvas.height);
              node.ctx.fillText(`正在加载资源 ${now}/${all}`,cx,cy);
              if(now === all) node.start();
            }
            node.$assets[k] = img;
          }
        }
      }

      // var data = window.config;
      // node.assets = data;
      // node.$assets = {};
      // var now = 0, all = Object.keys(data).length;
      // node.ctx.clearRect(0,0,node.canvas.width, node.canvas.height);
      // node.ctx.fillText(`正在加载资源 ${now}/${all}`,cx,cy);
      // for(var k in data) {
      //   var img = new Image();
      //   img.src = data[k];
      //   img.onload = function () {
      //     now++;
      //     node.ctx.clearRect(0,0,node.canvas.width, node.canvas.height);
      //     node.ctx.fillText(`正在加载资源 ${now}/${all}`,cx,cy);
      //     if(now === all) node.start();
      //   }
      //   node.$assets[k] = img;
      // }
    }

    start () {
      var self = this, canvas = this.canvas, ctx = this.ctx;
      // 游戏状态：0-未开始，1-主角出场，2-游戏中，3-暂停，4-结束
      this.status = 0;
      // 游戏帧
      this.frame = 0;
      this.score = 0;
      this.boom = 2;
      this.stopEnemy = 0;
      this.time1 = 40*5;
      this.time2 = 40*10;
      this.time3 = 40*15;
      this.level = 1;
      // 角色
      new Background();
      new Logo();
      new StartButton();
      var pauseBtn = new PauseButton();
      new PauseBg();
      this.hero = new Hero();
      new BoomBtn();
      new OverBg();
      new RestartButton();

      this.gameId = setInterval(function(){
        if(true) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for(var a of self.actors) {
            if(a.update) a.update();
            if(a.render) a.render();
          }

          if ($game.status > 0) {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = '16px consolas';
            ctx.fillText(`得分: ${self.score}`, $game.status===1? pauseBtn.size.width + pauseBtn.left + 5 : 5, pauseBtn.size.height/2 + pauseBtn.top);
          }

          if($game.status === 1 && $game.hero.status === 0) {
            if ($game.stopEnemy > 0) {
              $game.stopEnemy--;
            }
            else {
              if($game.frame%$game.time1 === 0) {
                var count = Math.round(Math.random()*2) + 1;
                for(var i=0;i<count;i++) {
                  new Enemy({type:1});
                }
              }
              if($game.frame%$game.time2 === 0) {
                var count = Math.round(Math.random()) + 1;
                for(var i=0;i<count;i++) {
                  new Enemy({type:2});
                }
              }
              if($game.frame%$game.time3 === 0) {
                new Enemy({type: 3});
              }
            }
            if($game.frame%1600 === 0) {
              new Buff({});
            }
            if($game.frame%4000 === 0) {
              new Boom({});
            }
          }

          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.font = '16px consolas';
          ctx.fillText(`当前帧: ${self.frame}`, canvas.width - 5, 5);
          if($game.status!==2) self.frame++;

          if($game.score >= 100000 && $game.level === 1) {
            $game.level ++;
            $game.time1 -= 1*40;
            $game.time2 -= 2*40;
            $game.time3 -= 3*40;
          }
          if($game.score >= 300000 && $game.level === 2) {
            $game.level ++;
            $game.time1 -= 1*40;
            $game.time2 -= 2*40;
            $game.time3 -= 3*40;
          }
          if($game.score >= 700000 && $game.level === 3) {
            $game.level ++;
            $game.time1 -= 1*40;
            $game.time2 -= 2*40;
            $game.time3 -= 3*40;
          }
          if($game.score >= 1500000 && $game.level === 4) {
            $game.level ++;
            $game.time1 -= 1*40;
            $game.time2 -= 2*40;
            $game.time3 -= 3*40;
          }
        }
      }, 25);

    }

    over () {
      this.status = 3;
    }

    restart () {
      this.actors.forEach(v => v.delete());
      clearInterval(this.gameId);
      this.start();
    }

    conversion (img) {
      var n = 720/this.canvas.width;
      return {
        width: img.width/n,
        height: img.height/n
      }
    }
  }

  window.onload = function () {
    // 设置游戏画布的宽高为与屏幕等宽、登高
    var canvas = document.getElementById('gameCanvas');
    canvas.width = Math.min(720, document.body.offsetWidth);
    canvas.height = document.body.offsetHeight;

    var $evt = {
      start: {},
      last: {},
      computed: {}
    }

    var touchstart = function (e) {
      var x = e.touches[0].clientX - canvas.offsetLeft;
      var y = e.touches[0].clientY - canvas.offsetTop;
      $evt.start = $evt.last = {x, y};
      for(var v of $game.actors) {
        if(v.filterClick($evt.start)) {
          if(v.clickBefore) v.clickBefore($evt);
          if(v.onclick) {
            if(v.onclick($evt) === false) break;
          }
        }
      }
    }
    var touchend = function () {
      for(var v of $game.actors) {
        if(v.filterEnd($evt.last)&&v.filterEnd($evt.start)) {
          if(v.clickAfter) v.clickAfter($evt);
          if(v.onend) {
            if(v.onend($evt) === false) break;
          }
        }
      }
    }
    var touchmove = function (e) {
      var x = e.touches[0].clientX - canvas.offsetLeft;
      var y = e.touches[0].clientY - canvas.offsetTop;
      $evt.computed = {
        x: x - $evt.last.x,
        y: y - $evt.last.y
      };
      $evt.last = {x, y};
      for(var v of $game.actors) {
        if(true) {
          if(v.onmove) {
            if(v.onmove($evt)===false) break;
          }
        }
      }
    }

    canvas.addEventListener('touchstart', touchstart);
    canvas.addEventListener('touchmove', touchmove);
    canvas.addEventListener('touchend', touchend);
    window.$game = new Game(canvas);
  }

})();