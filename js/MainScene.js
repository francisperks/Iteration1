class BaseScene extends Phaser.Scene {
    map;
    player;
    collisionLayer;
    camera;
    cursors;
    score;
    uiScene;
    attack1;
    attack2;
    attack3;
    slash;
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
        this.slash = this.load.spritesheet('slash', 'assets/slash.png', { frameWidth: 110, frameHeight: 129 });






        this.load.image('main-tileset', 'assets/tileset.png');
        this.load.image('clouds', 'assets/clouds.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.tilemapTiledJSON('test-map', 'assets/level1.json');
    }
    create() {
        this.map = this.make.tilemap({ key: 'test-map' });
        this.map.mainTileset = this.map.addTilesetImage('tileset', 'main-tileset');
        this.map.clouds = this.map.addTilesetImage('clouds', 'clouds');
        this.map.sky = this.map.addTilesetImage('sky', 'sky');
        this.map.farGrounds = this.map.addTilesetImage('far-grounds', 'far-grounds')
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        let sky = this.map.createStaticLayer('sky', [this.map.sky], 0, 0); sky.setScrollFactor(0.1)
        let clouds2 = this.map.createStaticLayer('clouds-back', [this.map.clouds, this.map.sky, this.map.mainTileset], 0, 0); clouds2.setScrollFactor(0.2);
        let clouds = this.map.createStaticLayer('clouds', [this.map.clouds, this.map.sky, this.map.mainTileset], 0, 0); clouds.setScrollFactor(0.3)
        this.map.createStaticLayer('background', [this.map.mainTileset], 0, 0);
        this.map.createStaticLayer('floor', [this.map.mainTileset], 0, 0);

        // get reference to object layer in tilemap data
        let objectLayer = this.map.getObjectLayer("objects");
        let enemyObjects = [];
        // create temporary array for enemy spawn points
        // retrieve custom properties for objects
        objectLayer.objects.forEach(function (object) {
            object = Utils.RetrieveCustomProperties(object);
            // test for object types
            if (object.type === "playerSpawn") {
                this.createPlayer(object);
            } else if (object.type === "enemySpawn") {
                enemyObjects.push(object);
            } else if (object.type === "bossSpawn") {
                enemyObjects.push(object);
            }
        }, this)
        for (let i = 0; i < enemyObjects.length; i++) {
            this.createEnemy(enemyObjects[i]);
        }

        this.map.createStaticLayer('foreground', [this.map.mainTileset], 0, 0);
        this.createCollision();
        this.setCamera();
        this.cursors = this.input.keyboard.createCursorKeys();


        this.anims.create({
            key: 'slash',
            frames: this.anims.generateFrameNumbers('slash', {
                start: 0,
                end:4,
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
        }),
        

            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('player-idle', {
                    start: 0,
                    end: 3,
                }),
                frameRate: 6,
                repeat: 0,
            }),

            this.anims.create({
                key: 'jump',
                frames: this.anims.generateFrameNumbers('player-jump', {
                    start: 0,
                    end: 3,
                }),
                frameRate: 12,
                repeat: -1
            }),

            this.anims.create({
                key: 'jump2',
                frames: this.anims.generateFrameNumbers('player-jump', {
                    start: 3,
                    end: 3,
                }),
                frameRate: 12,
                repeat: -1
            }),

            this.anims.create({
                key: 'fall',
                frames: this.anims.generateFrameNumbers('player-jump', {
                    start: 4,
                    end: 5,
                }),
                frameRate: 12,
                repeat: -1
            }),

            this.anims.create({
                key: 'attack1',
                frames: this.anims.generateFrameNumbers('player-attack1', {
                    start: 0,
                    end: 5,
                }),
                frameRate: 6,
                repeat: 0,
            }),
            this.score = 0;
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createUIScene(this.scene.key);
        var attack1 = this.input.keyboard.addKey('q');
        if (attack1.isDown){
            console.log('attack1')
            this.animateAttack1();
        }

    }
    update() {
        if (this.cursors.left.isDown) {
            this.player.flipX = true;
            this.player.setVelocityX(-120);

            if (this.player.body.onFloor()) {this.player.anims.play('walk', true);}
        }

        else if (this.cursors.right.isDown){
            this.player.flipX = false;
            this.player.setVelocityX(120);

            if (this.player.body.onFloor()) {this.player.anims.play('walk', true);}
        }

        else {
            this.player.setVelocityX(0);
            this.player.anims.play('idle', true)

            if (this.player.body.onFloor()) {this.player.anims.play('idle', true);}
            else {this.player.anims.play('jump', true);}
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.onFloor()) {
            this.player.anims.play('jump', true);
            this.player.setVelocityY(-175);
        }

        if (this.player.body.velocity.y > 0) {this.player.anims.play('fall')}

        else if(this.player.body.velocity.y < 0){this.player.anims.play('jump2')}


        this.input.keyboard.on('keydown_W', function (event) {     
       });
        

        //HIT BOX FIX ON FLIP
        if (this.player.flipX) {this.player.setOffset(20, 16);} else {this.player.setOffset(0, 16);}


    }

    animateAttack1(){
        this.player.anims.play('attack1', 60, false)
    }

    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player-idle', 1);
        // this.player.setCollideWorldBounds(true);
        this.player.setSize(27, 32, true);
        this.player.setOffset(0, 16);
    }
    createCollision() {
        this.collisionLayer = this.map.getLayer('floor').tilemapLayer;
        this.collisionLayer.setCollisionBetween(0, 1000);
        this.physics.add.collider(this.player, this.collisionLayer);
        // this.physics.add.collider(this.skulls, this.collisionLayer);
    }
    setCamera() {
        this.camera = this.cameras.getCamera('')
        this.camera.startFollow(this.player);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.setZoom(1.25);
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

        this.pauseBtn.setScale(0.4)

        //Add the pauseBtn to the scene. This will now make it display.
        this.add.existing(this.pauseBtn);

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