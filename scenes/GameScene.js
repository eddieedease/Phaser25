class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.lastDirection = 'down'; // Track the last direction the player was facing
        this.enemies = [];
    }

    preload() {
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('bullet', 'assets/bullet.png'); // Placeholder for projectile
        this.load.image('wall', 'assets/wall.png'); // Placeholder for wall
    }

    create() {
        // Create a larger game field
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Create walls
        this.walls = this.physics.add.staticGroup();
        this.createMaze();

        // Create player
        this.player = this.physics.add.sprite(100, 100, 'player'); // Adjust starting position
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);

        // Create enemies
        for (let i = 0; i < 5; i++) {
            const enemy = this.createEnemy();
            this.enemies.push(enemy);
        }

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
                this.scale.resize(window.innerWidth, window.innerHeight);
                this.cameras.main.setViewport(0, 0, window.innerWidth, window.innerHeight);
            }
        });

        // Enemy shooting timer
        this.time.addEvent({
            delay: 2000,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        this.player.setVelocity(0);

        if (this.wasd.W.isDown) {
            this.player.setVelocityY(-200);
            this.lastDirection = 'up';
            this.player.setRotation(Phaser.Math.DegToRad(0));
        } else if (this.wasd.S.isDown) {
            this.player.setVelocityY(200);
            this.lastDirection = 'down';
            this.player.setRotation(Phaser.Math.DegToRad(180));
        }

        if (this.wasd.A.isDown) {
            this.player.setVelocityX(-200);
            this.lastDirection = 'left';
            this.player.setRotation(Phaser.Math.DegToRad(270));
        } else if (this.wasd.D.isDown) {
            this.player.setVelocityX(200);
            this.lastDirection = 'right';
            this.player.setRotation(Phaser.Math.DegToRad(90));
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            this.hitscanShoot();
        }

        if (Phaser.Input.Keyboard.JustDown(this.jKey)) {
            this.projectileShoot();
        }

        this.enemies.forEach(enemy => {
            this.physics.moveToObject(enemy, this.player, 50);
            this.updateEnemyDirection(enemy);
        });
    }

    hitscanShoot() {
        this.flashPlayer();
        // Check if any enemy is hit
        this.enemies.forEach(enemy => {
            if (this.isEnemyHit(enemy)) {
                enemy.hits = (enemy.hits || 0) + 1;
                this.flashEnemy(enemy);
                if (enemy.hits >= 10) {
                    enemy.setTint(0xff0000); // Change enemy color to red
                    enemy.setVelocity(0); // Stop enemy movement
                    enemy.body.immovable = true; // Make enemy immovable
                    enemy.setAlpha(0.5); // Lower opacity
                }
            }
        });
    }

    projectileShoot() {
        const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
        let velocity = { x: 0, y: 0 };

        switch (this.lastDirection) {
            case 'up':
                velocity.y = -300;
                bullet.setRotation(Phaser.Math.DegToRad(0));
                break;
            case 'down':
                velocity.y = 300;
                bullet.setRotation(Phaser.Math.DegToRad(180));
                break;
            case 'left':
                velocity.x = -300;
                bullet.setRotation(Phaser.Math.DegToRad(270));
                break;
            case 'right':
                velocity.x = 300;
                bullet.setRotation(Phaser.Math.DegToRad(90));
                break;
        }

        bullet.setVelocity(velocity.x, velocity.y);
        this.physics.add.collider(bullet, this.enemies, this.handleBulletHit, null, this);
        this.physics.add.collider(bullet, this.walls, this.handleWallCollision, null, this);
    }

    flashPlayer() {
        this.player.setTint(0xff0000); // Change player color to red when shooting
        this.time.delayedCall(100, () => {
            this.player.clearTint(); // Reset player color after 100ms
        });
    }

    flashEnemy(enemy) {
        enemy.setTint(0xffff00); // Change enemy color to yellow when hit
        this.time.delayedCall(100, () => {
            enemy.clearTint(); // Reset enemy color after 100ms
        });
    }

    isEnemyHit(enemy) {
        switch (this.lastDirection) {
            case 'up':
                return enemy.y < this.player.y && Math.abs(enemy.x - this.player.x) < 50;
            case 'down':
                return enemy.y > this.player.y && Math.abs(enemy.x - this.player.x) < 50;
            case 'left':
                return enemy.x < this.player.x && Math.abs(enemy.y - this.player.y) < 50;
            case 'right':
                return enemy.x > this.player.x && Math.abs(enemy.y - this.player.y) < 50;
            default:
                return false;
        }
    }

    handleBulletHit(bullet, enemy) {
        bullet.destroy();
        enemy.hits = (enemy.hits || 0) + 1;
        this.flashEnemy(enemy);
        if (enemy.hits >= 10) {
            enemy.setTint(0xff0000); // Change enemy color to red
            enemy.setVelocity(0); // Stop enemy movement
            enemy.body.immovable = true; // Make enemy immovable
            enemy.setAlpha(0.5); // Lower opacity
        }
    }

    handleWallCollision(bullet, wall) {
        bullet.destroy();
    }

    handleCollision(player, enemy) {
        // Implement collision logic
    }

    createMaze() {
        // Create walls around the edges
        this.walls.create(800, 0, 'wall').setScale(16, 1).refreshBody();
        this.walls.create(800, 1200, 'wall').setScale(16, 1).refreshBody();
        this.walls.create(0, 600, 'wall').setScale(1, 12).refreshBody();
        this.walls.create(1600, 600, 'wall').setScale(1, 12).refreshBody();

        // Create some internal walls to form a maze
        this.walls.create(400, 300, 'wall').setScale(1, 6).refreshBody();
        this.walls.create(1200, 300, 'wall').setScale(1, 6).refreshBody();
        this.walls.create(800, 600, 'wall').setScale(6, 1).refreshBody();
        this.walls.create(800, 900, 'wall').setScale(6, 1).refreshBody();
    }

    createEnemy() {
        let x, y;
        do {
            x = Phaser.Math.Between(50, 1550);
            y = Phaser.Math.Between(50, 1150);
        } while (this.physics.overlapRect(x, y, 50, 50, true).length > 0);

        const enemy = this.physics.add.sprite(x, y, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.body.immovable = true; // Make enemy immovable
        this.physics.moveToObject(enemy, this.player, 50); // Ensure enemies start moving immediately
        return enemy;
    }

    updateEnemyDirection(enemy) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const degrees = Phaser.Math.RadToDeg(angle);

        if (degrees >= -45 && degrees <= 45) {
            enemy.setRotation(Phaser.Math.DegToRad(90)); // Right
        } else if (degrees > 45 && degrees < 135) {
            enemy.setRotation(Phaser.Math.DegToRad(180)); // Down
        } else if (degrees >= 135 || degrees <= -135) {
            enemy.setRotation(Phaser.Math.DegToRad(270)); // Left
        } else if (degrees < -45 && degrees > -135) {
            enemy.setRotation(Phaser.Math.DegToRad(0)); // Up
        }
    }

    enemyShoot() {
        this.enemies.forEach(enemy => {
            if (enemy.hits < 10 && Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 300) {
                const bullet = this.physics.add.sprite(enemy.x, enemy.y, 'bullet');
                this.physics.moveToObject(bullet, this.player, 200);
                this.updateEnemyDirection(bullet); // Fix the runtime error
                this.physics.add.collider(bullet, this.player, this.handlePlayerHit, null, this);
                this.physics.add.collider(bullet, this.walls, this.handleWallCollision, null, this);
            }
        });
    }

    handlePlayerHit(bullet, player) {
        bullet.destroy();
        // Implement player hit logic
    }
}

export default GameScene;
