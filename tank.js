EnemyTank = function (index, game, player, player2,bullets) { 

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.player2 = player2;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    //this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 50, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function() {

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    
    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < this.game.physics.arcade.distanceBetween(this.tank, this.player2)){
        if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
        {
            this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);
            if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
            {
                this.nextFire = this.game.time.now + this.fireRate;

                var bullet = this.bullets.getFirstDead();

                bullet.reset(this.turret.x, this.turret.y);

                bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
            }
        }
    }
    else if (this.game.physics.arcade.distanceBetween(this.tank, this.player2) < 300)
    {
        this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player2);
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player2, 500);
        }
    }

};

var game = new Phaser.Game(1200, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload () {

    //game.load.atlas('tank', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');
    game.load.image('tank', 'ist.png');
    game.load.atlas('enemy', 'assets/games/tanks/enemy-tanks.png', 'assets/games/tanks/tanks.json');
    game.load.image('logo', 'http://epic-webgis-portugal.isa.ulisboa.pt/images/logoIST.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
    game.load.image('earth', 'starfield.png');
    game.load.spritesheet('kaboom', 'assets/games/tanks/explosion.png', 64, 64, 23);
    game.load.audio('run','run.mp3');

    game.load.spritesheet('button', 'assets/buttons/button_sprite_sheet.png', 193, 71);
    game.load.image('fire1', 'assets/particles/fire1.png');
    game.load.image('fire2', 'assets/particles/fire2.png');
    game.load.image('fire3', 'assets/particles/fire3.png');
    game.load.image('smoke', 'assets/particles/smoke-puff.png');

    
}

var land;

var shadow;
var tank;
var turret;
var emitter;

var button;

var shadow2;
var tank2;
var turret2;
var emitter2;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var currentSpeed = 0;
var currentSpeed2 = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;


var cooldown=0;

function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-600, -300, 1200, 600);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 1200, 600, 'earth');
    land.fixedToCamera = true;

    // button
    button = game.add.button(0, 0, 'button', actionOnClick, this, 2, 1, 0);

    /*button.onInputOver.add(over, this);
    button.onInputOut.add(out, this);
    button.onInputUp.add(up, this);*/

    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 50);
    emitter.gravity.y=0;
    emitter.makeParticles( [ 'fire1', 'fire2', 'fire3', 'smoke' ] );
    
    emitter.setAlpha(1, 0, 30);
    emitter.setScale(0.01, 0.01, 0.01, 0.01);

    emitter.start(false, 200, 50);

    emitter.visible=false;

    //  The base of our tank
    tank = game.add.sprite(100, 0, 'tank');
    tank.anchor.setTo(0.5, 0.5);
    //tank.angle=-90;
    //tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(300, 300);
    //tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(100, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);


    ////////////// P2

    emitter2 = game.add.emitter(game.world.centerX, game.world.centerY, 50);
    emitter2.gravity.y=0;
    emitter2.makeParticles( [ 'fire1', 'fire2', 'fire3', 'smoke' ] );
    
    emitter2.setAlpha(1, 0, 30);
    emitter2.setScale(0.01, 0.01, 0.01, 0.01);

    emitter2.start(false, 200, 50);

    emitter2.visible=false;

    //  The base of our tank
    tank2 = game.add.sprite(-100, 0, 'tank');
    tank2.anchor.setTo(0.5, 0.5);
    //tank.angle=-90;
    //tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank2, Phaser.Physics.ARCADE);
    tank2.body.drag.set(0.2);
    tank2.body.maxVelocity.setTo(300, 300);
    //tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret2 = game.add.sprite(-100, 0, 'tank', 'turret');
    turret2.anchor.setTo(0.3, 0.5);







    tank.hp = 10;
    tank2.hp = 10;



    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(1000, 'bullet');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    //enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 10;
    enemiesAlive = enemiesTotal;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyTank(i, game, tank,tank2, enemyBullets));
    }

    //  A shadow below our tank
    shadow = game.add.sprite(100, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5);

    shadow2 = game.add.sprite(-100, 0, 'tank', 'shadow');
    shadow2.anchor.setTo(0.5, 0.5);




    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();

    tank2.bringToTop();
    turret2.bringToTop();

    //logo = game.add.sprite(0, 200, 'logo');
    //logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    //game.camera.follow(tank);
    //game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    //game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pausesound=game.input.keyboard.addKey(Phaser.Keyboard.M)
    pausegame = game.input.keyboard.addKey(Phaser.Keyboard.P)
    kA=game.input.keyboard.addKey(Phaser.Keyboard.A)
    kW=game.input.keyboard.addKey(Phaser.Keyboard.W)
    kD=game.input.keyboard.addKey(Phaser.Keyboard.D)
    kTab=game.input.keyboard.addKey(Phaser.Keyboard.TAB)
    game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR,
        Phaser.Keyboard.M,
        Phaser.Keyboard.P,
        Phaser.Keyboard.A,
        Phaser.Keyboard.W,
        Phaser.Keyboard.D,
        Phaser.Keyboard.TAB
    ]);

    run=game.add.audio('run');
    run.play('',20,1,true,true);
}

function removeLogo () {

    game.input.onDown.remove(removeLogo, this);
    logo.kill();

}

function update () {

    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
    game.physics.arcade.overlap(enemyBullets, tank2, bulletHitPlayer, null, this);


    game.physics.arcade.collide(tank,tank2);
   
   //colisoes entre inimigos
   /* 
    for (var i =0; i<enemiesTotal; i++){
        for(var j=0; j<i; j++){
            if (i!=j)
            game.physics.arcade.collide(enemies[i].tank,enemies[j].tank);
        }
    }*/

    enemiesAlive = 0;
    emitter.visible=false;
    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.collide(tank2, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            game.world.wrap(enemies[i].tank);
            enemies[i].update();
        }
    }
    currentSpeed = 0;
    if (cursors.left.isDown)
    {
        tank.angle -= 5;
        
    }
    else if (cursors.right.isDown)
    {
        tank.angle += 5;
    }

    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        currentSpeed = 200;
        emitter.visible=true;
        //emitter.minParticleSpeed=Phaser.Point.negative(tank.body.velocity);
        //emitter.maxParticleSpeed=Phaser.Point.negative(tank.body.velocity);

        emitter.setXSpeed(-tank.body.acceleration.x);
        emitter.setYSpeed(-tank.body.acceleration.y);

        emitter.emitX = tank.x;
        emitter.emitY = tank.y;

        
    }
    //if (cursors.down.isDown && tank.body.speed > 15){
      //  currentSpeed = -10;
    //}
    

    if (tank.body.speed >= 0)
    {
        game.physics.arcade.accelerationFromRotation(tank.rotation+Math.PI/2, currentSpeed, tank.body.acceleration);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;
    shadow.kill();
    turret.kill();
    turret.x = tank.x;
    turret.y = tank.y;

    turret.rotation = tank.rotation;

    game.world.wrap(tank);

    if (fireButton.isDown)
    {
        //  Boom!
        fire();
        Phaser.Point.subtract(tank.body.velocity,game.physics.arcade.velocityFromRotation(tank.rotation+Math.PI/2, 0.001*(500-tank.body.speed)),tank.body.velocity);
    }

////////////////////////////////////////////////////////////////
    ///////////p2
    currentSpeed2 = 0;
    if (kA.isDown)
    {
        tank2.angle -= 5;
    }
    else if (kD.isDown)
    {
        tank2.angle += 5;
    }

    if (kW.isDown)
    {
        //  The speed we'll travel at
        currentSpeed2 = 200;
        emitter2.visible=true;
        //emitter.minParticleSpeed=Phaser.Point.negative(tank.body.velocity);
        //emitter.maxParticleSpeed=Phaser.Point.negative(tank.body.velocity);

        emitter2.setXSpeed(-tank2.body.velocity.x*10);
        emitter2.setYSpeed(-tank2.body.velocity.y*10);

        emitter2.emitX = tank2.x;
        emitter2.emitY = tank2.y;

        
    }
    //if (cursors.down.isDown && tank.body.speed > 15){
      //  currentSpeed = -10;
    //}
    

    if (tank2.body.speed >= 0)
    {
        game.physics.arcade.accelerationFromRotation(tank2.rotation+Math.PI/2, currentSpeed2, tank2.body.acceleration);
    }

    //land.tilePosition.x = -game.camera.x;
    //land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow2.x = tank2.x;
    shadow2.y = tank2.y;
    shadow2.rotation = tank2.rotation;
    shadow2.kill();
    turret2.kill();
    turret2.x = tank2.x;
    turret2.y = tank2.y;

    turret2.rotation = tank2.rotation;

    game.world.wrap(tank2);

    if (kTab.isDown)
    {
        //  Boom!
        fire2();
        Phaser.Point.subtract(tank2.body.velocity,game.physics.arcade.velocityFromRotation(tank2.rotation+Math.PI/2, 0.001*(500-tank2.body.speed)),tank2.body.velocity);
    }








    if(pausesound.downDuration(15)){
        if(run.paused){
            run.resume();
        }
        else {
            run.pause();
        }
    }
    if(pausegame.downDuration(15)){
            run.pause();
            game.paused=true;
            Pause();
    }

}

function Pause(){
    var t1= game.time.now;
    while(game.paused){
        if(pausegame.downDuration(15) && game.time.now-t1 > 20 ){
            game.paused=false
            run.resume();
        }

    }

}


function bulletHitPlayer (tank, bullet) {

    bullet.kill();
    if(cooldown == 1){
        tank.hp -= 1;
    }
    if(tank.hp<=0){
        tank.hp=0;
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
        tank.kill();
        turret.kill();
        shadow.kill();
    }

}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}



function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = turret.rotation+Math.PI/2;

        Phaser.Point.add(tank.body.velocity,game.physics.arcade.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity),bullet.body.velocity);
    }

}


function fire2 () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret2.x, turret2.y);

        bullet.rotation = turret2.rotation+Math.PI/2;

        Phaser.Point.add(tank2.body.velocity,game.physics.arcade.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity),bullet.body.velocity);
    }

}


/*function up() {
    console.log('button up', arguments);
}

function over() {
    console.log('button over');
}

function out() {
    console.log('button out');
}
*/
function actionOnClick () {

    cooldown=1;
    button.kill();

}


function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 32, 32);
    game.debug.text('P1 HP: ' + tank.hp + ' / ' + 10, 220, 32);
    game.debug.text('P2 HP: ' + tank2.hp + ' / ' + 10, 500, 32);

}