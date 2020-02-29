class BaseScene extends Phaser.Scene {
    map;
    player;
    collisionLayer;
    camera;
    cursors;
    score;
    uiScene;

    constructor() {
        super("GameScene");
    }

    init(data) {
        console.log(data);
        this.music = new AudioManager(this);
        this.sfx = new AudioManager(this);

        console.log(this.sfx);

        if(data.music) {
            this.music.volume = data.music.volume;
            this.music.muted = data.music.muted;
        }

        if(data.sfx) {
            this.sfx.volume = data.sfx.volume;
            this.sfx.muted = data.sfx.muted;
        }
    }

    preload() {
        this.load.image('tileset', '../assets/tileset_Padded.png');
        this.load.image('clouds', '../assets/clouds_Padded.png');
        this.load.image('sky', '../assets/sky_Padded.png');
        this.load.spritesheet('player', '../assets/player/player_idle.png', {frameWidth: 48, frameHeight: 48});

        this.load.tilemapTiledJSON('level1', '../assets/level1.json');
    }

    create() {
        this.map = this.make.tilemap({key: 'level1'});
        this.map.tileset = this.map.addTilesetImage('tileset_Padded', 'tileset');
        this.map.clouds = this.map.addTilesetImage('clouds_Padded', 'clouds');
        this.map.sky = this.map.addTilesetImage('sky_Padded', 'sky');

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.map.createStaticLayer('sky', [this.map.sky], 0, 0);
        this.map.createStaticLayer('clouds-back', [this.map.clouds], 0, 0);
        this.map.createStaticLayer('clouds-front', [this.map.clouds], 0, 0);
        this.map.createStaticLayer('background', [this.map.tileset], 0, 0);
        this.map.createStaticLayer('platforms', [this.map.tileset], 0, 0);

        this.createPlayer();
        this.createCollision();
        this.setCamera();
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if(this.cursors.left.isDown) {
            this.player.setVelocityX(-100);
            this.player.flipX = true;
        } else if(this.cursors.right.isDown) {
            this.player.setVelocityX(100);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
        }

        if(Phaser.Input.Keyboard.JustDown(this.cursors.space)){
            this.player.setVelocityY(-200);
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(16, 16, 'player', 1);
        this.player.setCollideWorldBounds(true);
    }

    createCollision() {
        this.collisionLayer = this.map.getLayer('platforms').tilemapLayer;
        this.collisionLayer.setCollisionBetween(0, 1000);

        this.physics.add.collider(this.player, this.collisionLayer);
    }

    setCamera() {
        this.camera = this.cameras.getCamera("");
        this.camera.startFollow(this.player);
        this.camera.setZoom(2);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
}