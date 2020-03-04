class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0){
        super(scene, x, y, texture, frame);
        this.maxSpeed = 120;

        this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.ability1 = new Ability(scene, this, 10, function(){
            if(this.sprite !== null) {
                console.log("fire ability 1");
            }
        });
    }

    moveRight() {
        this.flipX = false;
        this.setVelocityX(this.maxSpeed);
    }

    moveLeft() {
        this.flipX = true;
        this.setVelocityX(-this.maxSpeed);
    }

    moveJump(){
        this.setVelocityY(-170)
        
    }

    update() {
        this.playAnimations();
    }

    createAnimations() {

    }

    playAnimations() {

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
    constructor(scene, owner, strength, callback, cooldown = 0.5, xOffset = 0, yOffset = 0, texture = "", animationKey = ""){
        this.scene = scene;
        this.owner = owner;
        this.xOffset = xOffset;

        this.fire = callback;

        this.sprite = null;

        if(texture !== ""){
            this.sprite = this.scene.add.sprite();
        }
    }
}