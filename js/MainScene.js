// function LERP(a, b, f) { return a + f * (b - a) }
class BaseScene extends Phaser.Scene {
    constructor() {
        super("MainScene");

        this.map = 0;
        this.player = 0;
        this.enemies = 0;
        this.collisionLayer = 0;
        this.camera = 0;
        this.cursors = 0;
        this.score = 0;
        this.bullets = 0;
        this.uiScene = 0;
        this.enemiesEnts = [];
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
        this.load.spritesheet('player-idle', 'assets/player/player_idle-new.png', { frameWidth: 64, frameHeight: 48 });
        this.load.spritesheet('player-attack1', 'assets/player/player_attack1-new.png', { frameWidth: 64, frameHeight: 48 });
        this.load.spritesheet('player-attack2', 'assets/player/player_attack2-new.png', { frameWidth: 64, frameHeight: 48 });
        this.load.spritesheet('player-attack3', 'assets/player/player_attack3.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-death', 'assets/player/player_death.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player-walk', 'assets/player/player_walk.png', { frameWidth: 64, frameHeight: 48 });
        this.load.spritesheet('player-jump', 'assets/player/player_jump-new.png', { frameWidth: 64, frameHeight: 48 });
        this.load.spritesheet('enemy-idle', 'assets/enemy/enemy_idle-new.png', { frameWidth: 48, frameHeight: 40 });
        this.load.spritesheet('enemy-walk', 'assets/enemy/enemy_walk-new.png', { frameWidth: 48, frameHeight: 40 });
        this.load.spritesheet('enemy-die', 'assets/enemy/enemy-die.png', { frameWidth: 48, frameHeight: 40 });
        this.load.spritesheet('enemy_attack', 'assets/enemy/enemy_attack.png', { frameWidth: 48, frameHeight: 40 });
        this.load.spritesheet('enemy-hit', 'assets/enemy/enemy_hit.png', { frameWidth: 48, frameHeight: 40 });
        this.load.spritesheet('slash', 'assets/slash-thick.png', { frameWidth: 30, frameHeight: 48});
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
                if (object.type === "playerSpawn") {
                    this.createPlayer(object);
                } else if (object.type === "enemySpawn") {
                    this.createEnemy(object);
                }
            }, this);
        }
        

        this.createCollision();
        this.setCamera();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createUIScene(this.scene.key);
    }

    update(time, dt) {
        this.player.update();

        if (this.cursors.left.isDown || this.uiScene.leftBtn.isDown) {this.player.moveLeft();}
        else if (this.cursors.right.isDown || this.uiScene.rightBtn.isDown) {this.player.moveRight();}
        else {this.player.setVelocityX(0);}
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.body.onFloor()) {this.player.moveJump();}
        if(this.player.body.y > 720){
            this.player.body.y = 50;
            this.player.body.x = 144;
        }
            this.uiScene.updateScore();
    }

    createPlayer(object) {
        this.player = new Player(this, object.x, object.y, 'player-idle');
        this.player.enableBody(true, this.player.x, this.player.y, true, true);
        this.player.setSize(18, 32, true);
        this.player.setOffset(23, 16)
        this.player.setDepth(5);
    }

    createEnemy(object) {
        this.enemy = new Enemy(this, object.x, object.y, 'enemy-idle');
        this.enemy.enableBody(true, this.enemy.x, this.enemy.y, true, true);
        this.enemies.add(this.enemy);
        this.scene.scene.enemy.giveZone();
        this.enemy.setDepth(4);
    }
    createCollision() {
        this.collisionLayer = this.map.getLayer('platforms').tilemapLayer;
        this.collisionLayer.setCollisionBetween(0, 10000);
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
            font: '20px Arial',
            fill: '#000000'
        });
        this.createPauseMenu();
        this.scene.launch(this);
    }

    updateScore() {
        this.score.setText('Score: ' + this.currentScene.player.score);
    }

    createPauseMenu() {
        //Create the pauseBtn. Note this will not yet make it display in the scene.
        this.pauseBtn = new Button(this, config.width - 80, 10, "pauseBtn", function () {
            this.scene.pauseMenu.visible = true;
            this.scene.currentScene.scene.pause();
        });
        
        this.leftBtn = new Button(this, 50, config.height - 150, "playBtn", function () {
            this.scene.currentScene.player.moveLeft();
        });
        this.rightBtn = new Button(this, 175, config.height - 150, "playBtn", function () {
            this.scene.currentScene.player.moveRight();
        })
        this.jumpBtn = new Button(this, config.width - 175, config.height - 150, "jumpBtn", function () {
            this.scene.currentScene.player.moveJump()
        })
        this.ability1 = new Button(this, config.width - 550, config.height - 150, "heart", function() {
            // this.scene.currentScene.player.attackOne.fire();
            if(!this.scene.currentScene.player.usingAbility){
                this.scene.currentScene.player.abilityHeal();
            }
        })
        this.ability2 = new Button(this, config.width - 425, config.height - 150, "attack1", function() {
            if(!this.scene.currentScene.player.usingAbility){
                this.scene.currentScene.player.attackOne();
            }
        })
        this.ability3 = new Button(this, config.width - 300, config.height - 150, "attack2", function() {
            if(!this.scene.currentScene.player.usingAbility){
                this.scene.currentScene.player.attackTwo();
            }
        })

        this.pauseBtn.setScale(0.55);
        this.leftBtn.setScale(1);
        this.rightBtn.setScale(1);
        this.jumpBtn.setScale(1);
        this.ability1.setScale(1);
        this.ability2.setScale(1);
        this.ability3.setScale(1);
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
        this.load.image("playBtn", "assets/ui/play-new-1.png");
        this.load.image("pauseBtn", "assets/ui/pause.png");
        this.load.image("settingsBtn", "assets/ui/settings-new-1.png");
        this.load.image("soundBtn", "assets/ui/sound.png");
        this.load.image("noSoundBtn", "assets/ui/no-sound.png");
        this.load.image("trophyBtn", "assets/ui/trophy.png");
        this.load.image("homeBtn", "assets/ui/home.png");
        this.load.image("menuBox", "assets/ui/menuBox.png");
        this.load.image("menuBack", "assets/ui/menuBack.png");
        this.load.image("sliderOutline", "assets/ui/slider-outline.png");
        this.load.image("sliderBar", "assets/ui/slider-bar.png");
        this.load.image("sliderDial", "assets/ui/slider-dial.png");
        this.load.image("full", "assets/ui/full-new-1.png");
        this.load.image("fullB", "assets/ui/full-new-2.png");
        this.load.image("heart", "assets/ui/heart.png")
        this.load.image("attack1", "assets/ui/attack1.png");
        this.load.image("attack2", "assets/ui/attack2.png");
        this.load.image("pauseMenu", "assets/ui/pauseMenu.png")
        this.load.image("contBtn", "assets/ui/contBtn.png")
        this.load.image("exitBtn", "assets/ui/exitBtn.png")
        this.load.image("fullBtn", "assets/ui/fullBtn.png")
        this.load.image("jumpBtn", "assets/ui/jump.png")
        this.load.audio("menuMusic", "assets/music/background-1.mp3");
        this.load.image("menuFront", "assets/ui/menu-front.png")
        this.load.image("menu-1", "assets/ui/menu-1.png")
        this.load.image("menu-2", "assets/ui/menu-2.png")
        this.load.image("menu-3", "assets/ui/menu-3.png")
        this.load.image("menu-4", "assets/ui/menu-4.png");
        this.load.image("menu-5", "assets/ui/menu-5.png");
    }

    create() {
        this.add.image(640,360,'menu-5');
        this.stars = this.add.image(640,200,'menu-4');
        this.cloudssss = this.add.image(640,360,'menu-3');
        this.moon = this.add.image(640,360,'menu-2');
        this.cloudsss = this.add.image(640,360,'menu-1');
        this.add.image(640,360,'menuFront');

        this.mainMenu = new Menu(this, 0, 0, 1280, 720, "menuFront", [
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
            this.fullscreen = new Button(this, 5, 5, "full", function () {
                if (!this.scene.scale.isFullscreen) {
                    this.scene.scale.startFullscreen();
                } else {
                    this.scene.scale.stopFullscreen();
                }
            }).setScale(0.75)
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
            new Slider(this, 280, 300, 250, 30, "sliderOutline", "sliderDial", function () {
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
        this.music.setVolume(0.2)
        this.music.addAudio('menuMusic', {
            loop: true
        });
        this.music.playAudio('menuMusic')
        this.sfx = new AudioManager(this);
    }

    update(){
        this.moon.y+=(Math.sin(this.scene.systems.time.now/500)/10)
        console.log()
        this.stars.x+=(Math.sin(this.scene.systems.time.now/250)/250)
        this.stars.y+=(Math.sin(this.scene.systems.time.now/250)/250)
        this.stars.scale+= (Math.sin(this.scene.systems.time.now/2500)/2500)
        this.cloudssss.scale = 1.25
        this.cloudsss.scale = 1.25
        this.cloudssss.x+=(Math.sin(this.scene.systems.time.now/-5000)/10)
        this.cloudsss.x+=(Math.sin(this.scene.systems.time.now/5000)/10)

        
    }
}

class Level1 extends BaseScene {
    constructor(){
        super('Level1');
    }
    preload() {
        super.preload();
    }

    create() {
        super.create();
    }

    update() {
        super.update();
    }
}

class Level2 extends BaseScene {
    constructor(){
        super('Level2');
    }

    preload(){

    }

    create(){

    }

    update(){

    }
}