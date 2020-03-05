class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);
        this.maxSpeed = 120;
        this.usingAbility = false;

        this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.createAnimations("player-walk", "player-walk", 0, 5, 8, -1);
        this.createAnimations("player-jump", "player-jump", 3, 3, 12, 0);
        this.createAnimations("player-idle", "player-idle", 0, 3, 6, -1);
        this.createAnimations("player-fall", "player-jump", 4, 4, 12, 0);
        this.createAnimations("player-attack1", "player-attack1", 0, 5, 12, 0);
        this.createAnimations("player-attack2", "player-attack2", 0, 5, 12, 0);
        this.createAnimations("player-attack3", "player-death", 0, 5, 12, 0);
        this.attackOne = new Ability(scene, this, 10, function () {
            if (this.sprite !== null) {
                this.playAnimations("player-attack")
            }
        }, 2, -5, -30, "slash", "slash");

    }

    moveRight() {
        this.flipX = false;
        this.setVelocityX(this.maxSpeed);
        this.update();
    }

    moveLeft() {
        this.flipX = true;
        this.setVelocityX(-this.maxSpeed);
    }

    moveJump() {
        if (this.body.onFloor()) {
            this.setVelocityY(-170)
        }
    }

    update() {
        if (!this.usingAbility) {
            if (!this.body.onFloor() && this.body.velocity.y > 0) {
                this.playAnimations("player-fall")
            } else if (!this.body.onFloor() && this.body.velocity.y < 0) {
                this.playAnimations("player-jump")
            } else if (this.body.velocity.x === 0 && this.body.onFloor()) {
                this.playAnimations("player-idle")
            }
            else if (this.body.velocity.x > 0 || this.body.velocity.x < 0) {
                this.playAnimations("player-walk")
            }
        }
    }

    createAnimations(key, image, startFrame, endFrame, frameRate, repeat) {
        this.scene.anims.create({
            key: key,
            frames: this.scene.anims.generateFrameNumbers((image), {
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

    attackOne() {
    }
}

class Ability {
    constructor(scene, owner, strength, callback, cooldown = 0.5, xOffset = 0, yOffset = 0, texture = "", animationKey = "") {
        this.scene = scene;
        this.owner = owner;
        this.strength = strength;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
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
        
        this.zones = [];
        this.scene.anims.create({
            key: "enemyAttack",
            frames: this.scene.anims.generateFrameNumbers("enemy_attack", {
                start: 0,
                end: 17,
            }),
            frameRate: 12,
            repeat: 0,
        });
        
    }
    speedMult = 1;
    xCoord = -15;

    move() {
        var xOne = 306;
        var xTwo = 712;

        if (this.x > xTwo) {
            this.speedMult = -1;
            this.flipX = true;
            this.xCoord = 30;
        } else if (this.x < xOne) {
            this.speedMult = 1;
            this.flipX = false;
            this.xCoord = -15;
        }
        this.setVelocityX(30 * this.speedMult);

        this.graphics.clear();
        for(var i = 0; i < this.zones.length; i++){
            var tempZone = this.zones[i]; 
                tempZone.x = this.x -this.xCoord;
                tempZone.y = this.y - 12.5;
            if(tempZone.contains(this.scene.player.x, this.scene.player.y)){
                this.seePlayer();
                this.attack();
                // this.graphics.fillStyle(0x00000aa, 1)
            } 
            // this.graphics.fillRectShape(tempZone);
        }
    }

    seePlayer(){
        this.setVelocity(0)

    }

    giveZone(){
        this.graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x0000aa }, fillStyle: { color: 0xaa0000 } });
        this.zone = new Phaser.Geom.Rectangle(this.x, this.y, 5, this.body.height)
        this.graphics.fillRectShape(this.zone)
        this.zones.push(this.zone)
    }


    update() {
        this.move();
    }

    attack() {
    }
}