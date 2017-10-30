
// Define Game parameters*********************************************

var game = new Phaser.Game(1200, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });


//   PRELOAD*************************************************************

function preload () {

    //game.load.atlas('ship', 'assets/games/ships/ships.png', 'assets/games/ships/ships.json');
    game.load.image('ship', 'ist.png');
    game.load.image('asteroid', 'assets/games/asteroids/asteroid1.png');
    game.load.image('bullet', 'assets/games/asteroids/bullets.png');
    game.load.image('starfield', 'starfield.png');
    game.load.spritesheet('kaboom', 'assets/games/tanks/explosion.png', 64, 64, 23);
    game.load.audio('run','run.mp3');

    game.load.spritesheet('button', 'assets/buttons/buttons/startb.png', 190, 70);
    
    
    game.load.image('emitter1','assets/particles/flame1.png');
    game.load.image('emitter2','assets/particles/flame2.png');
    //game.load.image('emitter3','assets/particles/white-smoke.png');
    
    game.load.bitmapFont('desyrel', 'assets/fonts/bitmapFonts/nokia.png', 'assets/fonts/bitmapFonts/nokia.xml');
    game.load.bitmapFont('letra', 'assets/fonts/bitmapFonts/carrier_command.png', 'assets/fonts/bitmapFonts/carrier_command.xml');

    
}

// KEY VARIABLES *******************************************************

var starfield;

var ship;
var emitter;
var bmpText;
var overtext;
var bigtext;
var text;
var instructions;


var asteroids;
var asteroidsTotal = 15;
var asteroidsAlive = asteroidsTotal;
var period=60;


var explosions;
var button;

var impulse = 200;
var turn = 300;
var drag=0;



var bullets;
var fireRate = 130;
var nextFire = 0;
var mag=5;
var bulletspeed = 500;

var cooldown = 0;

//keys

var cursors;
var fireButton;
var pausesound;
var pausegame;
var kA;
var kW;
var kD;
var kTab;

// sound
var run;

// CLASSES *************************************************

var Asteroid = function (index, game, player) { 

    var x = player.x+game.camera.width*(Math.random()+1);
    var y = game.world.randomY;

    var scale = Math.random()*4 + 1;
    
    this.game = game;
    this.health = 1*scale;
    this.speed;
    this.player = player;
    this.alive = true;

    this.rock = game.add.sprite(x, y, 'asteroid');
    
    
    
    this.rock.anchor.set(0.5);
    
    this.rock.scale.setTo(scale);

    this.rock.name = index.toString();
    game.physics.enable(this.rock, Phaser.Physics.ARCADE);
    this.rock.body.mass=scale;
    this.rock.body.immovable = false;
    //this.rock.body.collideWorldBounds = true;
    this.rock.body.bounce.setTo(1, 1);

    this.rock.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.rock.rotation, this.speed, this.rock.body.velocity);

};

Asteroid.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.rock.kill();

        return true;
    }

    return false;

};

// CREATE STUFF *****************************************************

function create () {
    
    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;
    
    // scaling
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.maxWidth = game.width;
    game.scale.maxHeight = game.height;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize( true );
    
    game.cameraXMax = 99999;
    //game.platformXMax = 99999;
    
    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    
    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-600, -300, 1200, 600);
    

    //  Our tiled scrolling background
    starfield = game.add.tileSprite(0, 0, 1200, 600, 'starfield');
    starfield.fixedToCamera = true;

    
    // EMITTER
    emitter = game.add.emitter(game.world.centerX, game.world.centerY, 50);
    emitter.gravity.y=0;
    emitter.makeParticles( [ 'emitter1', 'emitter2'] );
    //emitter.setAlpha(1, 0, 30);
    //emitter.setScale(0.00001, 0.00001, 0.00001, 0.00001);
    emitter.setSize(1,1);
    emitter.setRotation(0,0);
    emitter.lifespan = 100;
    emitter.scale.setTo(0.5);
    //emitter.maxParticleSpeed = new Phaser.Point(-100,50);
    //emitter.minParticleSpeed = new Phaser.Point(-200,-50);
    
    
    //  SHIP
    ship = game.add.sprite(-200, 0, 'ship');
    ship.anchor.setTo(0.5, 0.5);
    ship.scale.setTo(0.8);
    ship.visible=false;
    //ship.body.mass=1;
    //ship.angle=-90;
    //ship.animations.add('move', ['ship1', 'ship2', 'ship3', 'ship4', 'ship5', 'ship6'], 20, true);
    
    // game over
    bmpText = game.add.bitmapText(250, 150, 'desyrel','Powered by, \nTiago & Rui!', 32);
    overtext = game.add.bitmapText(game.camera.centerX, game.camera.centerY, 'letra','Game Over!\n Your ship has travelled:\n' + ship.x + ' light-years.', 20);
    bigtext= game.add.bitmapText(game.camera.centerX, game.camera.centerY, 'letra','Game Over!\n Your ship has travelled:\n' + ship.x + ' light-years.', 20);
    overtext.visible=false;
    bigtext.visible = false;
    
    text = game.add.bitmapText(0, -150, 'desyrel','Oort Cloud', 70);
    text.anchor.setTo(0.5, 0.5);
    
    
    instructions = game.add.text(-350, 100, "Instructions:\n--Cursor keys to move\n--Spacebar to fire\n--P key to (un)pause game\n--M key to mute sound\n--Goal: To reach as far right as possible\n--Keep up the pace: left wall collision= game over!\n--1 asteroid hit => -1 HP\n--Be careful: asteroid belt ahead!", { font: "20px Times", fill: "#ffffff", align: "left" });
    instructions.anchor.setTo(0.5, 0.5);
    
    
    ship.addChild(emitter);
    emitter.x=0;
    emitter.y=-80;
    
    //  This will force it to decelerate and limit its speed
    game.physics.enable(ship, Phaser.Physics.ARCADE);
    ship.body.drag.set(drag);
    ship.body.maxVelocity.set(200);
    //ship.body.collideWorldBounds = true;

    // HP**************************
    ship.hp = 10;
    ship.xmax=0;


    ship.angle =-90;
    ship.body.velocity.x=120;

    //  Create some asteroids to waste :)
    asteroids = [];

    //asteroidsTotal = 15;
    //asteroidsAlive = asteroidsTotal;

    for (var i = 0; i < asteroidsTotal; i++)
    {
        asteroids.push(new Asteroid(i, game, ship));
    }


    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(mag, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('scale.x',2);
    bullets.setAll('scale.y',2);
    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    
    

    //game.camera.follow(ship);
    //game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    //game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pausesound=game.input.keyboard.addKey(Phaser.Keyboard.M);
    pausegame = game.input.keyboard.addKey(Phaser.Keyboard.P);
    kA=game.input.keyboard.addKey(Phaser.Keyboard.A);
    kW=game.input.keyboard.addKey(Phaser.Keyboard.W);
    kD=game.input.keyboard.addKey(Phaser.Keyboard.D);
    kTab=game.input.keyboard.addKey(Phaser.Keyboard.TAB);
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
    
    // Button
    button = game.add.button(-95, -35, 'button', actionOnClick, this);

    run=game.add.audio('run');
    
}

// KEY FUNCTIONS ****************************************************************


function asteroidHitPlayer (ship, asteroid) {

    
    if(cooldown){
        ship.hp -= 1;
        var collisionAnimation = explosions.getFirstExists(false);
        collisionAnimation.reset((ship.x+asteroid.x)/2, (ship.y+asteroid.y)/2);
        collisionAnimation.scale.setTo(0.5);
        collisionAnimation.play('kaboom', 30, false, true);
    }
    if(ship.hp<=0){
        ship.hp=0;
        var explosionAnimation = explosions.getFirstExists(false);
        if(explosionAnimation!=null){
            explosionAnimation.reset(ship.x, ship.y);
            explosionAnimation.scale.setTo(4);
            explosionAnimation.play('kaboom', 30, false, true);
        }
        ship.kill();
        GameOver();
    }

}

function bulletHitasteroid (asteroid, bullet) {

    bullet.kill();

    var destroyed = asteroids[asteroid.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(asteroid.x, asteroid.y);
        explosionAnimation.scale.setTo(asteroid.body.mass);
        explosionAnimation.play('kaboom', 30, false, true);
    }
    else {
        var collisionAnimation = explosions.getFirstExists(false);
        collisionAnimation.reset((bullet.x+asteroid.x)/2, (bullet.y+asteroid.y)/2);
        collisionAnimation.scale.setTo(0.5);
        collisionAnimation.play('kaboom', 30, false, true);
    }

}



function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);
        bullet.reset(ship.x, ship.y);
        bullet.rotation = ship.rotation+Math.PI/2;

        Phaser.Point.add(ship.body.velocity,game.physics.arcade.velocityFromRotation(bullet.rotation, bulletspeed, bullet.body.velocity),bullet.body.velocity);
    }

}

function actionOnClick () {

    cooldown=1;
    button.kill();
    run.play('',20,1,true,true);
    bmpText.destroy();
    text.destroy();
    instructions.destroy();
    ship.visible=true;

}

function GameOver () {
            ship.kill();
            run.pause();
            cooldown=0;
            overtext = game.add.bitmapText(game.camera.x + game.camera.width/4 + 80, game.camera.y + game.camera.height/2, 'desyrel','Your ship has travelled:\n\n    ' + Math.floor(ship.x/10) + ' light-years\n\nPlease, refresh to restart (F5)', 35);
            bigtext = game.add.bitmapText(game.camera.x + game.camera.width/4, game.camera.y + game.camera.height/4, 'letra','Game Over!', 50);
            overtext.visible=true;
            bigtext.visible=true;
            game.paused=true;
}

// UPDATE ************************************************************************************

function update () {

    //game.physics.arcade.overlap(enemyBullets, ship, bulletHitPlayer, null, this);
    //game.physics.arcade.overlap(enemyBullets, ship2, bulletHitPlayer, null, this);


    //game.physics.arcade.collide(ship,ship2);
   
   //colisoes entre inimigos
   /* 
    for (var i =0; i<asteroidsTotal; i++){
        for(var j=0; j<i; j++){
            if (i!=j)
            game.physics.arcade.collide(asteroids[i].ship,asteroids[j].ship);
        }
    }*/
    if(cooldown){
    
        game.world.setBounds( -game.world.width/2, -game.world.height/2, ship.xmax+game.world.width, game.world.height);
    
        //game.cameraXMax = Math.max( game.cameraXMax, ship.x - game.world.height + 130 );
        //game.camera.x = game.cameraXMax;
        if(ship.x-game.camera.x<game.camera.width/2+100)
            game.camera.x+=2;
        else if(ship.x-game.camera.x<game.camera.width/2+300) game.camera.x+=5;
        else game.camera.x+=7;
    
        
        
       if(ship.x<=game.camera.x )
           GameOver();
        
        
        ship.xmax = Math.max( ship.xmax, Math.abs( ship.x - ship.xOrig) );
        if(ship.x/10 > 700&& ship.x/10<=1500) period = 50;
        else if (ship.x/10>1500) period=45;
        else period = 60;
        
        
        if(Math.floor(ship.x + 1)%period==0){
            asteroids.push(new Asteroid(asteroidsTotal, game, ship));
            asteroidsTotal++;
        }
        
        //if( ship.x < game.cameraXMax + game.world.height && ship.hp>=0 ) {
          //  cooldown=0
        //}
        
        ship.body.moves=true;
            for (var i = 0; i < asteroids.length; i++){
                asteroids[i].rock.body.moves=true;
            }
        asteroidsAlive = 0;
        //emitter.visible=false;
        for (var i = 0; i < asteroids.length; i++)
        {
            if (asteroids[i].alive)
            {
                asteroidsAlive++;
                game.physics.arcade.collide(ship, asteroids[i].rock,asteroidHitPlayer);
                game.physics.arcade.overlap(bullets, asteroids[i].rock, bulletHitasteroid, null, this);
                game.world.wrap(asteroids[i].rock,0,false,false,true);
                for(var j=0;j<i;j++) game.physics.arcade.collide(asteroids[i].rock,asteroids[j].rock);
            }
        }
        
        
        
        // MOVEMENT ***********************************
        
        if (cursors.left.isDown)
        {
            ship.body.angularVelocity = -turn;
            
        }
        else if (cursors.right.isDown)
        {
            ship.body.angularVelocity = turn;
        }
        else ship.body.angularVelocity=0;
    
        if (cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(ship.rotation+Math.PI/2, impulse, ship.body.acceleration);
            //  The impulse from jetting
            //emitter.visible=true;
            //emitter.minParticleSpeed=Phaser.Point.negative(ship.body.velocity);
            //emitter.maxParticleSpeed=Phaser.Point.negative(ship.body.velocity);
    
            // JETTING
            /*emitter.angle=ship.angle+180;
            emitter.setXSpeed(-0.1*ship.body.acceleration.x);
            emitter.setYSpeed(-0.1*ship.body.acceleration.y);
            
            emitter.emitX = ship.x;
            emitter.emitY = ship.y;*/
            emitter.setXSpeed(-0.1*ship.body.acceleration.x);
            emitter.setYSpeed(-0.1*ship.body.acceleration.y);
            emitter.emitParticle();
    
            
        }
        else{
            ship.body.acceleration.set(0);
        }
        //if (cursors.down.isDown && ship.body.speed > 15){
          //  currentSpeed = -10;
        //}
        
    
        starfield.tilePosition.x = -game.camera.x;
        starfield.tilePosition.y = -game.camera.y;
    
        // Wrap WORLD
    
        game.world.wrap(ship,0,false,false,true);
    
    // FIRE
        if (fireButton.isDown)
        {
            //  Boom!
            fire();
            Phaser.Point.subtract(ship.body.velocity,game.physics.arcade.velocityFromRotation(ship.rotation+Math.PI/2, 0.005*(bulletspeed-ship.body.speed)),ship.body.velocity);
        }
    
        
    
    }
    else {
        ship.body.moves=false;
        for (var i = 0; i < asteroids.length; i++){
            asteroids[i].rock.body.moves=false;
        }
        
    }
    // SOUND
    
    if(pausesound.downDuration(15)){
        if(run.paused){
            run.resume();
        }
        else {
            run.pause();
        }
    }
    
    if(pausegame.downDuration(15)){
            if(cooldown){
                cooldown=0;
                run.pause();
            }
            else {
                cooldown=1;
                run.resume();
                button.kill();
            }
        }
        
        

}


// RENDER *************************************************

function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    //game.debug.text('Enemies: ' + asteroidsAlive + ' / ' + asteroidsTotal, 32, 32);
    game.debug.text('HP: ' + ship.hp + ' / ' + 10, 220, 32);
    game.debug.text('Distance: ' + Math.floor(ship.x/10) , 400, 32);
}

