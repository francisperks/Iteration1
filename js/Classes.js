class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);
        this.maxSpeed = 120;
        this.usingAbility = false;
        this.damageCount = 0;
        this.damageMax = 10;
        this.score = 0;
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
        this.createAnimations("slash", "slash", 0, 5, 15, 0);

        /*this.attackOne = new Ability(scene, this, 10, function () {
            if (this.sprite !== null) {
                this.playAnimations("player-attack")
            }
        }, 2, -5, -30, "slash", "slash");*/
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

    checkOrientation() {
        if (this.flipX) {
            return true;
        } else if (!this.flipX) {
            return false;
        }
    }

    moveJump() {
        if (this.body.onFloor()) {
            this.setVelocityY(-170)
        }
    }

    damage() {
        this.scene.cameras.main.shake(200, 0.005);
        this.damageCount++;
    }

    isDead() {
        // check whether damagecount equals or exceeds damagemax
        if (this.damageCount >= this.damageMax) {
            return true
        }
    }


    handleAttac(enemy) {
        if (this.scene.physics.overlap(enemy, this.attack, function (object1, object2) {
            object1.beingAttacked = true;
            object2.disableBody(false, true)
            object2.visible = true;
            if (!enemy.isDead()) {
                enemy.damage()
            }
        })) { } else {
            this.scene.enemy.beingAttacked = false;
        };

    }


    update() {

        // this.scene.score.setText('Score: ' + this.score);

        if (!this.usingAbility) {
            if (!this.body.onFloor() && this.body.velocity.y > 0) {
                this.playAnimations("player-fall")
            } else if (!this.body.onFloor() && this.body.velocity.y < 0) {
                this.playAnimations("player-jump")
            } else if (this.body.velocity.x === 0 && this.body.onFloor()) {
                this.playAnimations("player-idle")
            } else if (this.body.velocity.x > 0 || this.body.velocity.x < 0) {
                this.playAnimations("player-walk")
            }
        }
        this.scene.enemies.children.entries.forEach(enemy => this.handleAttac(enemy))

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
        this.usingAbility = true;
        this.playAnimations("player-attack1");
        var attack = this.scene.physics.add.sprite(this.x + 20, this.y + 5, "slash", 0);
        attack.velocity = 30
        if (this.checkOrientation() == false) {
            attack.x = this.x + 20;
            attack.flipX = false;
            attack.setVelocityX(attack.velocity)
        } else if (this.checkOrientation() == true) {
            attack.x = this.x - 20;
            attack.flipX = true;
            attack.setVelocityX(-attack.velocity)
        }
        attack.setSize(12, 24)
        attack.setDepth(10)
        attack.body.setAllowGravity(false);
        attack.anims.play("slash", true);
        attack.on('animationcomplete', function () {
            this.destroy();
        });


        this.attack = attack

        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.usingAbility = false;
            }
        })
    }

    attackTwo() {
        this.usingAbility = true;
        this.playAnimations("player-attack1");
        var attack = this.scene.physics.add.sprite(this.x + 20, this.y + 5, "slash", 0);
        var r = 0

        if (this.checkOrientation() == false) {
            attack.x = this.x + 20
            r = 40
            attack.flipX = false;
            attack.setVelocityX(30)
        } else if (this.checkOrientation() == true) {
            attack.x = this.x - 20;
            r = 40
            attack.flipX = true;
            attack.setVelocityX(-30)
        }
        attack.setSize(12, 24)
        attack.body.setAllowGravity(false);
        attack.anims.play("slash", true);
        attack.on('animationcomplete', function () {
            this.destroy();
        });

        this.attack = attack
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.usingAbility = false;
            }
        })
    }

    abilityHeal() {
        this.setVelocityY(-200)
        this.setVelocityX(200)
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
        this.speedMult = 1;
        this.xCoord = -25;
        this.damageCount = 0;
        this.damageMax = 10;
        this.body = new Phaser.Physics.Arcade.Body(scene.physics.world, this);
        this.usingAbility = false;
        this.setSize(10, 24).setOffset(19, 16).setScale(1.25)
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.currentScene = this.scene;

        this.zones = [];

        this.scene.anims.create({
            key: "enemy-attack",
            frames: this.scene.anims.generateFrameNumbers("enemy_attack", {
                start: 0,
                end: 7,
            }),
            frameRate: 12,
            repeat: 0,
        });

        this.scene.anims.create({
            key: "enemyR",
            frames: this.scene.anims.generateFrameNumbers("enemy_attack", {
                start: 8,
                end: 17,
            }),
            frameRate: 12,
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'enemy-walk',
            frames: this.scene.anims.generateFrameNumbers('enemy-walk', {
                start: 0,
                end: 12,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'enemy-die',
            frames: this.scene.anims.generateFrameNumbers('enemy-die', {
                start: 0,
                end: 14,
            }),
            frameRate: 15,
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'enemy-hit',
            frames: this.scene.anims.generateFrameNumbers('enemy-hit', {
                start: 0,
                end: 7,
            }),
            frameRate: 15,
            repeat: 0,
        });

        this.scene.anims.create({
            key: 'enemy-idle',
            frames: this.scene.anims.generateFrameNumbers('enemy-idle', {
                start: 0,
                end: 7,
            }),
            frameRate: 12,
            repeat: 0,
        });

    }

    damage() {
        this.scene.player.score++;
        this.damageCount += 5;
        this.anims.play("enemy-hit", this);
        this.isBeingDamaged = true;
        this.on("animationcomplete-enemy-hit", function () {
            this.isBeingDamaged = false
        }, this)
    }

    isDead() {
        if (this.damageCount >= this.damageMax) {
            return true
        }
    }

    enemyAttack() {
        if (!this.seePlayer) {
            this.usingAbility = false;
            this.move();
        } else if (this.seePlayer && !this.usingAbility) {
            this.usingAbility = true;
            this.anims.play("enemy-attack", true)
            this.on('animationcomplete-enemy-attack', function () {
                this.enAttack = enAttack
                var enAttack = this.scene.physics.add.sprite(this.x + 20, this.y + 5, "slash", 0);
                enAttack.velocity = 30
                if (this.checkOrientation() == false) {
                    enAttack.x = this.x + 20;
                    enAttack.flipX = false;
                    enAttack.setVelocityX(enAttack.velocity)
                } else if (this.checkOrientation() == true) {
                    enAttack.x = this.x - 20;
                    enAttack.flipX = true;
                    enAttack.setVelocityX(-enAttack.velocity)
                }
                enAttack.setSize(12, 24)
                enAttack.setDepth(10)
                enAttack.body.setAllowGravity(false);
                enAttack.anims.play("slash", true);
                enAttack.on('animationcomplete-slash', function () {
                    this.destroy();
                });
                this.anims.play("enemyR", true)
                this.on("animationcomplete-enemyR", function () {
                    this.usingAbility = false;
                })
            });
        }

    }

    move() {
        if (!this.isDead()) {
            if (this.x > this.x2) {             
                this.speedMult = -1;
                this.flipX = true;
                this.xCoord = 30;
            } else if (this.x < this.x1) {
                this.speedMult = 1;
                this.flipX = false;
                this.xCoord = -25;
            }
            this.setVelocityX(30 * this.speedMult);
        } else if(this.isDead()){
            console.log("enemy dead")
        }
        this.graphics.clear();
    }

    zoneChecker() {
        for (var i = 0; i < this.zones.length; i++) {
            var tempZone = this.zones[i];
            tempZone.x = this.x - this.xCoord;
            tempZone.y = this.y - 5;
            if (tempZone.contains(this.scene.player.x, this.scene.player.y)) {
                this.seePlayer = true;
                // this.graphics.fillStyle(0x00000aa, 1)
            } else {
                this.seePlayer = false;
            }
            // this.graphics.fillRectShape(tempZone);
        }
    }

    checkOrientation() {
        if (this.flipX) {
            return true;
        } else if (!this.flipX) {
            return false;
        }
    }

    giveZone() {
        this.graphics = this.scene.add.graphics({
            lineStyle: {
                width: 2,
                color: 0x0000aa
            },
            fillStyle: {
                color: 0xaa0000
            }
        });
        this.zone = new Phaser.Geom.Rectangle(this.x, this.y, 5, this.body.height)
        this.graphics.fillRectShape(this.zone)
        this.zones.push(this.zone)
    }


    update() {
        this.graphics.clear();
        this.zoneChecker();
        if (!this.isDead()) {
            if (this.seePlayer) {
                this.setVelocityX(0)
                if (!this.usingAbility && this.seePlayer) {
                    this.enemyAttack();
                }
            }
            else if (!this.seePlayer || !this.isBeingDamaged) {
                this.move();
                this.setVelocityX(30 * this.speedMult);
                if (this.body.velocity.x > 0 || this.body.velocity.x < 0) {
                    this.anims.play("enemy-walk", true)
                    this.usingAbility = false;
                }
            }

        } else if (this.isDead()) {
            this.setVelocityX(0)
            this.anims.play("enemy-die", true)
            this.on('animationcomplete', function () {
                this.destroy();
            });
        }
    }
}