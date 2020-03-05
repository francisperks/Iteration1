class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);
        this.maxSpeed = 120;

        this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.ability1 = new Ability(scene, this, 10, function () {
            if (this.sprite !== null) {
                console.log("fire ability 1");
            }
        });
    }

    moveRight() {
        this.flipX = false;
        this.setVelocityX(this.maxSpeed);
        this.createAnimations("player-walk", "player-walk", 0, 5, 6, -1);
        this.playAnimations("player-walk")
    }

    moveLeft() {
        this.flipX = true;
        this.setVelocityX(-this.maxSpeed);
    }

    moveJump() {
        this.setVelocityY(-170)
    }

    update(){
    }

    createAnimations(key, image, startFrame, endFrame, frameRate, repeat) {
        this.anims.create({
            key: key,
            frames: Phaser.Animations.AnimationManager.generateFrameNumbers(image, {
                start: startFrame,
                end: endFrame,
            }),
            frameRate: frameRate,
            repeat: repeat,
        });
    }

    playAnimations(animationKey) {
        this.anims.play(animationKey, true)
    }

    ability1() {
        this.ability1.fire();
    }

    ability2() {

    }

    ability3() {

    }
}

class Ability {
    constructor(scene, owner, strength, callback, cooldown = 0.5, xOffset = 0, yOffset = 0, texture = "", animationKey = "") {
        this.scene = scene;
        this.owner = owner;
        this.xOffset = xOffset;

        this.fire = callback;

        this.sprite = null;

        if (texture !== "") {
            this.sprite = this.scene.add.sprite();
        }
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);

        this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);
        this.setSize(18, 24).setOffset(-2, 8).setScale(1.5).setDepth(0)
        scene.physics.add.existing(this);
        scene.add.existing(this);

    }

    speedMult = 1;

    move() {
        var xOne = 306;
        var xTwo = 712;

        if (this.x > xTwo){
            this.speedMult = -1;this.flipX = true;
    }else if (this.x < xOne){
            this.speedMult = 1;this.flipX = false;}
        this.setVelocityX(72 * this.speedMult);
    }

    update() {
        this.move();
        // console.log(this.x)
    }

    attack() {

    }
}