function LERP(a,b,f) {return a + f * (b-a)}
class BaseScene extends Phaser.Scene {
    map;
    player;
    enemies;
    collisionLayer;
    camera;
    cursors;
    score;
    bullets;
    uiScene;
    enemiesEnts=[];
    constructor() {
        super("MainScene");
    }
    init(data) {
        console.log(data);
        this.music = new AudioManager(this);
        this.sfx = new AudioManager(this);

        if (data.music) {
            this.music.volume = data.music.volume;
            this.music.muted = data.music.muted;
        }

        if (data.sfx) {
            this.sfx.volume = data.sfx.volume;
            this.sfx.muted = data.sfx.muted;
        }
    }
    preload() {
        this.load.spritesheet('player-idle', 'assets/player/player_idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-attack1', 'assets/player/player_attack1.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-attack2', 'assets/player/player_attack2.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-attack3', 'assets/player/player_attack3.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-death', 'assets/player/player_death.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-walk', 'assets/player/player_walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-jump', 'assets/player/player_jump.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('enemy', 'assets/enemy/enemy_idle.png', { frameWidth: 24, frameHeight: 32 });
        this.load.spritesheet('enemy-walk', 'assets/enemy/enemy_walk.png', {frameWidth: 22, frameHeight: 32});
        this.slash = this.load.spritesheet('slash', 'assets/slash.png', { frameWidth: 110, frameHeight: 129 });
        this.load.image('bullet', 'assets/bullet.png');

        this.load.image('tileset', 'assets/tileset_Padded.png');
        this.load.image('clouds', 'assets/clouds.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/level4.json');
    }
    create() {
        this.map = this.make.tilemap({
            key: 'tilemap'
        });
        this.enemies = this.physics.add.group();
        this.enemies.runChildUpdate  = true; 
        this.map.mainTileset = this.map.addTilesetImage('tileset_Padded', 'tileset')
        this.map.clouds = this.map.addTilesetImage('clouds', 'clouds');
        this.map.sky = this.map.addTilesetImage('sky', 'sky');
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.map.createStaticLayer('sky', [this.map.sky], 0, 0).setScrollFactor(0.1);
        this.map.createStaticLayer('clouds-back', [this.map.clouds], 0, 0).setScrollFactor(0.4);
        this.map.createStaticLayer('clouds-front', [this.map.clouds], 0, 0).setScrollFactor(0.7);
        this.map.createStaticLayer('background', [this.map.mainTileset], 0, 0);
        this.map.createStaticLayer('platforms', [this.map.mainTileset], 0, 0);

        // get reference to object layer in tilemap data
        let objectLayer = this.map.getObjectLayer("objects");
        // create temporary array for enemy spawn points
        // retrieve custom properties for objects
        if (objectLayer) {
            objectLayer.objects.forEach(function (object) {
                object = Utils.RetrieveCustomProperties(object);
                // test for object types
                if (object.type === "playerSpawn") {
                    this.createPlayer(object);
                } else if (object.type === "enemySpawn") {
                    this.createEnemy(object);
                }
            }, this);
        }


        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 500
        })

        // this.map.createStaticLayer('foreground', [this.map.mainTileset], 0, 0);
        this.createCollision();
        this.setCamera();
        this.cursors = this.input.keyboard.createCursorKeys();


        
        ////// ANIMATIONS PLAYER
            this.anims.create({
            key: 'slash',
            frames: this.anims.generateFrameNumbers('slash', {
                start: 0,
                end: 4,
                first: 4
            }),
            frameRate: 10,
            })

            this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
            })

            this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', {
                start: 0,
                end: 3,
            }),
            frameRate: 6,
            repeat: 0,
            })

            this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player-jump', {
                start: 0,
                end: 3,
            }),
            frameRate: 12,
            repeat: -1
            })

            this.anims.create({
            key: 'jump2',
            frames: this.anims.generateFrameNumbers('player-jump', {
                start: 3,
                end: 3,
            }),
            frameRate: 12,
            repeat: -1
            })

            this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('player-jump', {
                start: 4,
                end: 5,
            }),
            frameRate: 12,
            repeat: -1
            })

            this.anims.create({
            key: 'attack1',
            frames: this.anims.generateFrameNumbers('player-attack1', {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: 0,
            })

        /////// ANIMATIONS ENEMY


        this.score = 0;
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createUIScene(this.scene.key);
        var attack1 = this.input.keyboard.addKey('q');

    }
    update(time,dt) {
        if (this.cursors.left.isDown) {
            console.log("moving left")
            this.player.flipX = true;
            this.player.setVelocityX(-120);

            if (this.player.body.onFloor()) { this.player.anims.play('walk', true); }
        }

        else if (this.cursors.right.isDown) {
            this.player.flipX = false;
            this.player.setVelocityX(120);

            if (this.player.body.onFloor()) { this.player.anims.play('walk', true); }
        }

        else {
            this.player.setVelocityX(0);
            this.player.anims.play('idle', true)

            if (this.player.body.onFloor()) { this.player.anims.play('idle', true); }
            else { this.player.anims.play('jump', true); }
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.onFloor()) {
            this.player.anims.play('jump', true);
            this.player.setVelocityY(-175);
            this.tryAttack1();
        }

        if (this.player.body.velocity.y > 0) { this.player.anims.play('fall') }

        else if (this.player.body.velocity.y < 0) { this.player.anims.play('jump2') }


        this.input.keyboard.on('keydown_W', function (event) {
            this.tryAttack1();
        });
        this.input.keyboard.on('keydown_A', function (event) {
            console.log('Hello from the A Key!');
          });


        //HIT BOX FIX ON FLIP
        if (this.player.flipX) { this.player.setOffset(20, 16); } else { this.player.setOffset(0, 16); }

       // this.enemies.update(time,dt)
        // this.enemiesEnts.forEach(element => element.update(time,dt));
    }

    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player-idle', 1);
        // this.player.setCollideWorldBounds(true);
        this.player.setSize(27, 32, true);
        this.player.setOffset(0, 16);
    }

    createEnemy(object) {
        

         this.anims.create({
             key: 'enemy-walk',
             frames: this.anims.generateFrameNumbers('enemy-walk', {
                 start: 0,
                 end: 12,
             }),
             frameRate: 25,
             repeat: -1,
             
         })

         console.log(this)
        let origin = {
            //x: object.x,
            //y: object.y + object.height / 2
            x: 306,
            y: 320
        };
        let dest = {
            // x: object.x + object.width,
            // y: object.y + object.height / 2
            x: 712,
            y: 320
        };
        // console.log(origin,dest)
        let line = new Phaser.Curves.Line(origin, dest);
        this.enemy = this.add.follower(line, origin.x, origin.y, object.sprite);
        // this.physics.add.existing(enemy);
        this.enemies.add(this.enemy);

        this.enemy.startFollow({
            duration: 8000,
            repeat: -1,
            yoyo: true,
            onYoyo: this.flipImage,
            onRepeat: this.flipImage,
            callbackScope: this,
            startAt: Math.random(),
            ease: 'Sine.easeInOut',
        });
        this.enemy.anims.play('enemy-walk')
        this.enemy.body.allowGravity = true;


        
        // this.enemiesEnts.push(enemy)
        // enemy.update = function(t,dt) {
        //     enemy.storeX++;
        //     var n = (Math.sin(t/3000)/2)+0.5;
        //     var lerp = LERP(origin.x,dest.x,n);
        //     if (n >= 0.93) enemy.flipX = true;                  // thanks evan
        //     if (n <= 0.03) enemy.flipX = false;
        //    // enemy.flipX = t%3000 < 1500
        //     enemy.body.x = lerp;
        //     enemy.rotateToPath = true;
        // }

    }


    tryAttack1(pointer) {
        let bullet = this.bullets.get(this.player.x+ 50, this.player.y);
        if(bullet){
            this.attack1(bullet, this.player.direction, this.enemiesEnts)
        }
    }

    flipImage(){
        this.enemy.flipX = !this.enemy.flipX;
    }

    

    attack1(bullet,direction,target){
        bullet.setDepth(3);
        bullet.body.collideWorldBounds = true;
        bullet.body.onWorldBounds = true;
        bullet.enableBody(false, bullet.x, bullet.y, true, true);
        bullet.direction = direction;
        this.physics.velocityFromRotation(bullet.direction, 500, bullet.body.velocity);
        if(target === this.player){
            this.physics.add.overlap(this.player, bullet, this.playerHit, null, this);
        }else{
            // else check for overlap with all enemy tanks
            for(let i = 0; i  < this.enemies.length; i++){
                this.physics.add.overlap(this.enemies[i], bullet, this.attackHitEnemy, null, this)
            }
        }

    }

    createCollision() {
        this.collisionLayer = this.map.getLayer('platforms').tilemapLayer;
        this.collisionLayer.setCollisionBetween(0, 1000);
        this.physics.add.collider(this.player, this.collisionLayer);
        this.physics.add.collider(this.enemies, this.collisionLayer);
    }
    setCamera() {
        this.camera = this.cameras.getCamera('')
        this.camera.startFollow(this.player);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.setZoom(1);
    }
}

class UIScene extends Phaser.Scene {
    constructor() {
        super("UIScene");
    }

    createUIScene(sceneKey) {
        this.currentScene = this.scene.get(sceneKey);
        this.score = this.add.text(10, 10, 'Score: 0', {
            font: '18px Arial',
            fill: '#000000'
        });
        this.score.setText('Score: ' + this.currentScene.score);

        // this.createHealthBar();
        this.createPauseMenu();

        this.scene.launch(this);
    }

    updateScore(score) {
        this.score.setText('Score: ' + score);
    }

    // createHealthBar() {
    //     this.healthBar = {};
    //     this.healthBar.outline = this.add.sprite(config.width / 2, config.height - 100, 'hp-outline-big');
    //     this.healthBar.bar = this.add.sprite(config.width / 2, config.height - 100, 'hp-bar-big');
    //     this.healthBar.healthMask = this.add.sprite(this.healthBar.bar.x, this.healthBar.bar.y, "hp-bar-big");
    //     this.healthBar.healthMask.visible = false;
    //     this.healthBar.bar.mask = new Phaser.Display.Masks.BitmapMask(this, this.healthBar.healthMask);
    //     this.healthBar.healthMask.offSet = 0;
    // }
    createPauseMenu() {
        //Create the pauseBtn. Note this will not yet make it display in the scene.
        this.pauseBtn = new Button(this, config.width - 60, 10, "pauseBtn", function () {
            this.scene.pauseMenu.visible = true;
            this.scene.currentScene.scene.pause();
        });

        /// mvement butons

        this.leftBtn = new Button(this, 20, config.height - 60, "playBtn", function () {
            this.playerLeft()
        });
        this.rightBtn = new Button(this, 100, config.height - 60, "playBtn", function () {
            this.playerRight()
        })
        this.jumpBtn = new Button(this, config.width - 100, config.height - 60, "playBtn", function() {
            this.playerJump()
        })

        this.pauseBtn.setScale(0.4);
        this.leftBtn.setScale(0.4);
        this.rightBtn.setScale(0.4);
        this.jumpBtn.setScale(0.4);
        this.leftBtn.flipX = true;
        this.jumpBtn.angle = 90;
        this.jumpBtn.flipX = true;
        //Add the pauseBtn to the scene. This will now make it display.
        this.add.existing(this.pauseBtn);
        this.add.existing(this.leftBtn);
        this.add.existing(this.rightBtn);
        this.add.existing(this.jumpBtn);
        //Create the pauseMenu. Note this will not yet make it display in the scene.

        let x = 150;
        let x2 = x / 2 - 64;

        this.pauseMenu = new Menu(this, 840 / 2 - (x / 2), 75, x, 75, "menuBox", [
            this.menuPause = new Button(this, 7.5, 6, "homeBtn", function () {
                this.scene.currentScene.music.stopAllAudio();
                this.scene.currentScene.scene.stop();
                this.scene.scene.start("MenuScene");
            }).setScale(0.5),
            this.menuPlay = new Button(this, x - 71.5, 6, "playBtn", function () {
                this.scene.pauseMenu.visible = false;
                this.scene.currentScene.scene.resume();
            }).setScale(0.5),
            this.fullscreen = new Button(this, 71.5+150, 6, "trophyBtn", function () {
                if(!this.scene.scale.isFullscreen){
                    this.scene.scale.startFullscreen();
                } else{
                    this.scene.scale.stopFullscreen();
                }
            }).setScale(0.5)

        ]);

        //Add the pauseMenu to the scene. This will now make it display.
        this.add.existing(this.pauseMenu);

        //Hide the pauseMenu.
        this.pauseMenu.visible = false;

        //If a pointer goes up anywhere on the scene this event will fire.
        //Its aim is to find the Button that the pointer was pressed down on and clear the applied tint.
        this.input.on("pointerup", function (pointer) {
            pointer.lastBtn.clearTint();
        });
    }

    updateHealthBar(player) {
        this.healthBar.healthMask.offSet = this.healthBar.bar.width - (this.healthBar.bar.width * (1 - player.damageCount / player.damageMax));
        this.healthBar.healthMask.x = this.healthBar.bar.x - this.healthBar.healthMask.offSet;
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    init(data) {
        this.music = new AudioManager(this);
        this.sfx = new AudioManager(this);

        if (data.music) {
            this.music.volume = data.music.volume;
            this.music.muted = data.music.muted;
        }

        if (data.sfx) {
            this.sfx.volume = data.sfx.volume;
            this.sfx.muted = data.sfx.muted;
        }
    }

    //Load in all of the assets required.
    preload() {
        this.load.image("playBtn", "assets/ui/play.png");
        this.load.image("pauseBtn", "assets/ui/pause.png");
        this.load.image("settingsBtn", "assets/ui/settings.png");
        this.load.image("soundBtn", "assets/ui/sound.png");
        this.load.image("noSoundBtn", "assets/ui/no-sound.png");
        this.load.image("trophyBtn", "assets/ui/trophy.png");
        this.load.image("homeBtn", "assets/ui/home.png");
        this.load.image("menuBox", "assets/ui/menuBox.png");
        this.load.image("sliderOutline", "assets/ui/slider-outline.png");
        this.load.image("sliderBar", "assets/ui/slider-bar.png");
        this.load.image("sliderDial", "assets/ui/slider-dial.png");

        this.load.audio("menuMusic", "assets/music/background.mp3");
    }

    create() {
        //Create the mainMenu. Note this will not yet make it display in the scene.
        this.mainMenu = new Menu(this, 0, 0, 840, 400, "menuBox", [
            new Button(this, 210 - 64, 250, "playBtn", function () {
                this.scene.music.stopAllAudio();
                this.scene.scene.start("MainScene", {
                    music: this.scene.music,
                });
            }),
            new Button(this, 420 - 64, 250, "settingsBtn", function () {
                this.scene.settingsMenu.visible = true;
                this.scene.mainMenu.visible = false;
            }),
            new Button(this, 630 - 64, 250, "trophyBtn", function () {
                console.log("Achievements not yet set up.");
            }, false),

            
        ]);

        //Add the mainMenu to the scene. This will now make it display.
        this.add.existing(this.mainMenu);

        //Create the settingsMenu. Note this will not yet make it display in the scene.
        this.settingsMenu = new Menu(this, 0, 0, 840, 400, "menuBox", [
            new Button(this, 280 - 64, 20, "soundBtn", function () {
                console.log(this.toggleOn);
                this.scene.music.toggleMute();
            }, true, true, true, "noSoundBtn"),
            new Button(this, 560 - 64, 20, "homeBtn", function () {
                this.scene.settingsMenu.visible = false;
                this.scene.mainMenu.visible = true;
            }),
            new Slider(this, 280, 200, 250, 30, "sliderOutline", "sliderDial", function () {
                this.scene.music.setVolume(this.percent / 100);
            }),
            new MaskSlider(this, 280, 300, 250, 30, "sliderOutline", "sliderBar", "sliderDial", function () {
                this.scene.sfx.setVolume(this.percent / 100);
            }),
            
        ]);

        //Add the settingsMenu to the scene. This will now make it display.
        this.add.existing(this.settingsMenu);

        //Hide the settingsMenu.
        this.settingsMenu.visible = false;

        //If a pointer goes up on the scene (but not over a sprite) this event will fire.
        //Its aim is to find the Button that pointer was pressed down on and clear the applied tint.
        this.input.on("pointerup", function (pointer) {
            if (pointer.lastBtn) {
                pointer.lastBtn.clearTint();
            }
        });

        this.music = new AudioManager(this);
        this.music.addAudio('menuMusic', {
            loop: true
        });
        this.music.playAudio('menuMusic')
        this.sfx = new AudioManager(this);
    }
}