function LERP(a, b, f) { return a + f * (b - a) }
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
    enemiesEnts = [];
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
        this.load.spritesheet('enemy-walk', 'assets/enemy/enemy_walk.png', { frameWidth: 22, frameHeight: 32 });
        this.load.spritesheet('enemy_attack', 'assets/enemy/enemy_attack.png', { frameWidth: 43, frameHeight: 37 });
        this.load.spritesheet('slash', 'assets/slash.png', { frameWidth: 110, frameHeight: 129 });
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
        this.enemies.runChildUpdate = true;
        this.map.mainTileset = this.map.addTilesetImage('tileset_Padded', 'tileset')
        this.map.clouds = this.map.addTilesetImage('clouds', 'clouds');
        this.map.sky = this.map.addTilesetImage('sky', 'sky');
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.map.createStaticLayer('sky', [this.map.sky], 0, 0).setScrollFactor(0.1);
        this.map.createStaticLayer('clouds-back', [this.map.clouds], 0, 0).setScrollFactor(0.4);
        this.map.createStaticLayer('clouds-front', [this.map.clouds], 0, 0).setScrollFactor(0.7);
        this.map.createStaticLayer('background', [this.map.mainTileset], 0, 0);
        this.map.createStaticLayer('platforms', [this.map.mainTileset], 0, 0);
        let objectLayer = this.map.getObjectLayer("objects");
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
        this.createCollision();
        this.setCamera();
        this.cursors = this.input.keyboard.createCursorKeys();

        this.score = 0;
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createUIScene(this.scene.key);
        var attack1 = this.input.keyboard.addKey('q');

    }

    update(time, dt) {
        this.player.update();

        if (this.cursors.left.isDown || this.uiScene.leftBtn.isDown) {this.player.moveLeft();}
        else if (this.cursors.right.isDown || this.uiScene.rightBtn.isDown) {this.player.moveRight();}
        else {this.player.setVelocityX(0);}
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.onFloor()) {this.player.moveJump();}

        if (this.player.flipX) { this.player.setOffset(19, 16); } else { this.player.setOffset(0, 16); }

    }

    createPlayer(object) {
        this.player = new Player(this, object.x, object.y, 'player-idle');
        this.player.enableBody(true, this.player.x, this.player.y, true, true);
        this.player.setSize(27, 32, true);
        this.player.setOffset(0, 16);
        this.player.setDepth(5)
    }

    createEnemy(object) {
        this.enemy = new Enemy(this, object.x, object.y, 'enemy-idle');
        this.enemy.enableBody(true, this.enemy.x, this.enemy.y, true, true);
        this.enemies.add(this.enemy);
        this.anims.create({
            key: 'enemy-walk',
            frames: this.anims.generateFrameNumbers('enemy-walk', {
                start: 0,
                end: 12,
            }),
            frameRate: 15,
            repeat: -1,
        });
        this.enemy.anims.play('enemy-walk');
        this.scene.scene.enemy.giveZone();
        this.enemy.setDepth(4);
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
        this.camera.setZoom(2.5);
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
        this.createPauseMenu();
        this.scene.launch(this);
    }

    updateScore(score) {
        this.score.setText('Score: ' + score);
    }

    createPauseMenu() {
        //Create the pauseBtn. Note this will not yet make it display in the scene.
        this.pauseBtn = new Button(this, config.width - 80, 10, "pauseBtn", function () {
            this.scene.pauseMenu.visible = true;
            this.scene.currentScene.scene.pause();
        });
        
        this.leftBtn = new Button(this, 20, config.height - 150, "playBtn", function () {
            this.scene.currentScene.player.moveLeft();
        });
        this.rightBtn = new Button(this, 175, config.height - 150, "playBtn", function () {
            this.scene.currentScene.player.moveRight();
        })
        this.jumpBtn = new Button(this, config.width - 125, config.height - 150, "jumpBtn", function () {
            this.scene.currentScene.player.moveJump()
        })
        this.ability1 = new Button(this, config.width - 250, config.height - 150, "heart", function() {
            // this.scene.currentScene.player.attackOne.fire();
            this.scene.currentScene.player.usingAbility = true;
            this.scene.currentScene.player.playAnimations("player-attack3");
            this.scene.time.addEvent({delay: 500, callback: () => {this.scene.currentScene.player.usingAbility = false;}})
        })
        this.ability2 = new Button(this, config.width - 250, config.height - 275, "attack1", function() {
            console.log("attack1 ability animation")
            this.scene.currentScene.player.usingAbility = true;
            this.scene.currentScene.player.playAnimations("player-attack1");
            this.scene.time.addEvent({delay: 500, callback: () => {this.scene.currentScene.player.usingAbility = false;}})
        })
        this.ability3 = new Button(this, config.width - 125, config.height - 275, "attack2", function() {
            console.log("attack2 ability animation")
            this.scene.currentScene.player.usingAbility = true;
            this.scene.currentScene.player.playAnimations("player-attack2");
            this.scene.time.addEvent({delay: 500, callback: () => {this.scene.currentScene.player.usingAbility = false;}})
        })

        this.pauseBtn.setScale(0.55);
        this.leftBtn.setScale(0.75);
        this.rightBtn.setScale(0.75);
        this.jumpBtn.setScale(0.75);
        this.ability1.setScale(0.75);
        this.ability2.setScale(0.75);
        this.ability3.setScale(0.75);
        this.leftBtn.flipX = true;
        this.add.existing(this.pauseBtn);
        this.add.existing(this.leftBtn);
        this.add.existing(this.rightBtn);
        this.add.existing(this.jumpBtn);
        this.add.existing(this.ability1)
        this.add.existing(this.ability2)
        this.add.existing(this.ability3)

        this.pauseMenu = new Menu(this, (1280/2)-(900/2), (720/2)-(700/2), 900, 700, "pauseMenu", [
            this.menuPause = new Button(this, 470-150, 425, "exitBtn", function () {
                this.scene.currentScene.music.stopAllAudio();
                this.scene.currentScene.scene.stop();
                this.scene.scene.start("MenuScene");
            }).setScale(0.9),
            this.menuPlay = new Button(this, 470-150, 175, "contBtn", function () {
                this.scene.pauseMenu.visible = false;
                this.scene.currentScene.scene.resume();
            }).setScale(0.9),
            this.fullscreen = new Button(this, 470-150, 300, "fullBtn", function () {
                if (!this.scene.scale.isFullscreen) {
                    this.scene.scale.startFullscreen();
                } else {
                    this.scene.scale.stopFullscreen();
                }
            }).setScale(0.9)
        ]);
        this.add.existing(this.pauseMenu);
        this.pauseMenu.visible = false;
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

    preload() {
        this.load.image("playBtn", "assets/ui/play.png");
        this.load.image("pauseBtn", "assets/ui/pause.png");
        this.load.image("settingsBtn", "assets/ui/settings.png");
        this.load.image("soundBtn", "assets/ui/sound.png");
        this.load.image("noSoundBtn", "assets/ui/no-sound.png");
        this.load.image("trophyBtn", "assets/ui/trophy.png");
        this.load.image("homeBtn", "assets/ui/home.png");
        this.load.image("menuBox", "assets/ui/menuBox.png");
        this.load.image("menuBack", "assets/ui/menuBack.png");
        this.load.image("sliderOutline", "assets/ui/slider-outline.png");
        this.load.image("sliderBar", "assets/ui/slider-bar.png");
        this.load.image("sliderDial", "assets/ui/slider-dial.png");
        this.load.image("full", "assets/ui/full.png");
        this.load.image("heart", "assets/ui/heart.png")
        this.load.image("attack1", "assets/ui/attack1.png");
        this.load.image("attack2", "assets/ui/attack2.png");
        this.load.image("pauseMenu", "assets/ui/pauseMenu.png")
        this.load.image("contBtn", "assets/ui/contBtn.png")
        this.load.image("exitBtn", "assets/ui/exitBtn.png")
        this.load.image("fullBtn", "assets/ui/fullBtn.png")
        this.load.image("jumpBtn", "assets/ui/jump.png")
        this.load.audio("menuMusic", "assets/music/background.mp3");
    }

    create() {
        this.mainMenu = new Menu(this, 0, 0, 1280, 720, "menuBack", [
            new Button(this, 50, 165, "playBtn", function () {
                this.scene.music.stopAllAudio();
                this.scene.scene.start("MainScene", {
                    music: this.scene.music,
                });
            }),
            new Button(this, 50, 305, "settingsBtn", function () {
                this.scene.settingsMenu.visible = true;
                this.scene.mainMenu.visible = false;
            }),
            new Button(this, 50, 445, "trophyBtn", function () {
                console.log("Achievements not yet set up.");
            }, false),
            this.fullscreen = new Button(this, 35, 20, "full", function () {
                if (!this.scene.scale.isFullscreen) {
                    this.scene.scale.startFullscreen();
                } else {
                    this.scene.scale.stopFullscreen();
                }
            }).setScale(0.5)
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