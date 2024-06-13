const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        width: window.innerWidth,
        height: window.innerHeight
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let background;
let bullets;
let bulletTime = 0;
let isTouching = false;
let gameOver = false;
let score = 0;
let highScore = 0; // Variable to track the high score
let scoreText;
let muteButton;
let shootSound;
let hitSound;
let enemySpawnTimer; // Reference to the enemy spawn timer

function preload() {
    this.load.image('background', 'images/backgroundv.png');
    this.load.image('player_frame1', 'images/player/Exhaust_1_1_000.png');
    this.load.image('player_frame2', 'images/player/Exhaust_1_1_001.png');
    this.load.image('player_frame3', 'images/player/Exhaust_1_1_002.png');
    this.load.image('player_frame4', 'images/player/Exhaust_1_1_003.png');
    this.load.image('player_frame5', 'images/player/Exhaust_1_1_004.png');
    this.load.image('player_frame6', 'images/player/Exhaust_1_1_005.png');
    this.load.image('player_frame7', 'images/player/Exhaust_1_1_006.png');
    this.load.image('player_frame8', 'images/player/Exhaust_1_1_007.png');
    this.load.image('player_frame9', 'images/player/Exhaust_1_1_008.png');
    this.load.image('player_frame10', 'images/player/Exhaust_1_1_009.png');
    this.load.image('player_hit', 'images/player.png');
    this.load.image('enemy_frame1', 'images/Enemy/Flight_000.png');
    this.load.image('enemy_frame2', 'images/Enemy/Flight_001.png');
    this.load.image('enemy_frame3', 'images/Enemy/Flight_002.png');
    this.load.image('enemy_frame4', 'images/Enemy/Flight_003.png');
    this.load.image('enemy_frame5', 'images/Enemy/Flight_004.png');
    this.load.image('enemy_frame6', 'images/Enemy/Flight_005.png');
    this.load.image('enemy_frame7', 'images/Enemy/Flight_006.png');
    this.load.image('enemy_frame8', 'images/Enemy/Flight_007.png');
    this.load.image('enemy_frame9', 'images/Enemy/Flight_008.png');
    this.load.image('enemy_frame10', 'images/Enemy/Flight_009.png');
    this.load.image('enemy_hit', 'images/enemy.png');
    this.load.image('bullet', 'images/bullet.png');
    this.load.audio('shoot', 'sounds/shoot.mp3');
    this.load.audio('hit', 'sounds/hit.mp3');

    this.load.image('explosion_frame1', 'images/Enemy/Explosion_000.png');
    this.load.image('explosion_frame2', 'images/Enemy/Explosion_001.png');
    this.load.image('explosion_frame3', 'images/Enemy/Explosion_002.png');
    this.load.image('explosion_frame4', 'images/Enemy/Explosion_003.png');
    this.load.image('explosion_frame5', 'images/Enemy/Explosion_004.png');
    this.load.image('explosion_frame6', 'images/Enemy/Explosion_005.png');
    this.load.image('explosion_frame7', 'images/Enemy/Explosion_006.png');

    // Load player explosion images
    this.load.image('player_explosion_frame1', 'images/player/Explosion_1_000.png');
    this.load.image('player_explosion_frame2', 'images/player/Explosion_1_001.png');
    this.load.image('player_explosion_frame3', 'images/player/Explosion_1_002.png');
    this.load.image('player_explosion_frame4', 'images/player/Explosion_1_003.png');
    this.load.image('player_explosion_frame5', 'images/player/Explosion_1_004.png');
    this.load.image('player_explosion_frame6', 'images/player/Explosion_1_005.png');
    this.load.image('player_explosion_frame7', 'images/player/Explosion_1_006.png');
}

function create() {
    // Load the high score from local storage
    highScore = localStorage.getItem('highScore') || 0;

    // Responsive background
    background = this.add.tileSprite(0, 0, 1920, 1080, 'background').setOrigin(0, 0);
    resizeBackground(background);

    player = this.physics.add.sprite(960, 800, 'player_frame1');
    player.setCollideWorldBounds(true);
    player.setScale(0.1);

    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 20
    });

    // Initialize enemies group
    this.enemies = this.physics.add.group();

    enemySpawnTimer = this.time.addEvent({
        delay: 1000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerdown', function (pointer) {
        isTouching = true;
        movePlayer(pointer.x, pointer.y);
    });

    this.input.on('pointermove', function (pointer) {
        if (isTouching) {
            movePlayer(pointer.x, pointer.y);
        }
    });

    this.input.on('pointerup', function (pointer) {
        isTouching = false;
    });

    this.physics.add.collider(player, this.enemies, hitEnemy, null, this);
    this.physics.add.collider(bullets, this.enemies, hitEnemyWithBullet, null, this);

    this.anims.create({
        key: 'fly',
        frames: [
            { key: 'player_frame1' },
            { key: 'player_frame2' },
            { key: 'player_frame3' },
            { key: 'player_frame4' },
            { key: 'player_frame5' },
            { key: 'player_frame6' },
            { key: 'player_frame7' },
            { key: 'player_frame8' },
            { key: 'player_frame9' },
            { key: 'player_frame10' }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'EnemyFly',
        frames: [
            { key: 'enemy_frame1' },
            { key: 'enemy_frame2' },
            { key: 'enemy_frame3' },
            { key: 'enemy_frame4' },
            { key: 'enemy_frame5' },
            { key: 'enemy_frame6' },
            { key: 'enemy_frame7' },
            { key: 'enemy_frame8' },
            { key: 'enemy_frame9' },
            { key: 'enemy_frame10' }
        ],
        frameRate: 10,
        repeat: -1
    });

    player.play('fly');

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // Load sounds
    shootSound = this.sound.add('shoot', { volume: 0.5 });
    hitSound = this.sound.add('hit', { volume: 0.5 });

    // Mute button
    muteButton = this.add.text(16, 50, 'Mute', { fontSize: '32px', fill: '#fff' }).setInteractive();
    muteButton.on('pointerdown', () => toggleMute.call(this));

    // Create explosion animation
    this.anims.create({
        key: 'explode',
        frames: [
            { key: 'explosion_frame1' },
            { key: 'explosion_frame2' },
            { key: 'explosion_frame3' },
            { key: 'explosion_frame4' },
            { key: 'explosion_frame5' },
            { key: 'explosion_frame6' },
            { key: 'explosion_frame7' }
        ],
        frameRate: 10,
        repeat: 0,
        hideOnComplete: true
    });

    // Create player explosion animation
    this.anims.create({
        key: 'playerExplode',
        frames: [
            { key: 'player_explosion_frame1' },
            { key: 'player_explosion_frame2' },
            { key: 'player_explosion_frame3' },
            { key: 'player_explosion_frame4' },
            { key: 'player_explosion_frame5' },
            { key: 'player_explosion_frame6' },
            { key: 'player_explosion_frame7' }
        ],
        frameRate: 10,
        repeat: 0,
        hideOnComplete: true
    });

    // Resize event listener
    window.addEventListener('resize', resizeGame);
    resizeGame(); // Call once initially
}

function update(time, delta) {
    if (!gameOver) {
        background.tilePositionY -= 2;

        if (cursors.left.isDown) {
            player.setVelocityX(-200);
        } else if (cursors.right.isDown) {
            player.setVelocityX(200);
        } else {
            player.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            player.setVelocityY(-200);
        } else if (cursors.down.isDown) {
            player.setVelocityY(200);
        } else {
            player.setVelocityY(0);
        }

        if (cursors.space.isDown || isTouching) {
            fireBullet(time);
        }

        bullets.children.iterate(function (bullet) {
            if (bullet.active && bullet.y < 0) {
                bullet.disableBody(true, true);
            }
        });
    }
}

function spawnEnemy() {
    const x = Phaser.Math.Between(0, 1920);
    const y = Phaser.Math.Between(-50, -10);
    const enemy = this.enemies.create(x, y, 'enemy_frame1');
    enemy.setScale(0.15);
    enemy.setVelocityY(100);
    enemy.play('EnemyFly');
    enemy.flipY = true; // Invert the enemy sprite vertically
}

function fireBullet(time) {
    if (time > bulletTime) {
        let bullet = bullets.get();

        if (bullet) {
            bullet.enableBody(false, bullet.x, bullet.y, true, true);
            bullet.setPosition(player.x, player.y - 20);
            bullet.setVelocityY(-300);
            bullet.setScale(0.1);
            bulletTime = time + 250;
            shootSound.play();
        }
    }
}

function movePlayer(x, y) {
    player.setPosition(x, y);
}

function hitEnemy(player, enemy) {
    player.setTint(0xff0000);
    player.anims.stop();
    player.disableBody(true, true);
    enemy.anims.stop();
    enemy.disableBody(true, true);
    hitSound.play();
    gameOver = true;

    // Play player explosion animation
    const playerExplosion = this.add.sprite(player.x, player.y, 'player_explosion_frame1');
    playerExplosion.setScale(0.1);
    playerExplosion.play('playerExplode');

    // Play explosion animation for the enemy
    const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion_frame1');
    explosion.setScale(0.15);
    explosion.play('explode');

    // Stop and remove all enemies before pausing the physics and time
    stopAndRemoveAllEnemies(this);

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save the high score to local storage
    }

    // Pause physics and time after removing enemies
    this.physics.pause();
    this.time.paused = true;

    showGameOverText.call(this);
}

function hitEnemyWithBullet(bullet, enemy) {
    bullet.disableBody(true, true);

    // Play explosion animation
    const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion_frame1');
    explosion.setScale(0.15);
    explosion.play('explode');

    enemy.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
    hitSound.play();
}

function showGameOverText() {
    const gameOverText = this.add.text(960, 540, 'Game Over', { fontSize: '64px', fill: '#fff' });
    gameOverText.setOrigin(0.5, 0.5);
    const restartText = this.add.text(960, 640, 'Click to Restart', { fontSize: '32px', fill: '#fff' });
    restartText.setOrigin(0.5, 0.5);

    // Display the high score
    const highScoreText = this.add.text(960, 740, 'High Score: ' + highScore, { fontSize: '32px', fill: '#fff' });
    highScoreText.setOrigin(0.5, 0.5);

    this.input.on('pointerdown', () => {
        this.scene.restart();
        score = 0;
        gameOver = false;
        this.time.paused = false;
        this.physics.resume();
    });
}

function resizeBackground(background) {
    let scaleX = window.innerWidth / 1920;
    let scaleY = window.innerHeight / 1080;
    let scale = Math.max(scaleX, scaleY);
    background.setScale(scale).setScrollFactor(0);
}

function resizeGame() {
    const canvas = game.canvas;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + 'px';
        canvas.style.height = (windowWidth / gameRatio) + 'px';
    } else {
        canvas.style.width = (windowHeight * gameRatio) + 'px';
        canvas.style.height = windowHeight + 'px';
    }

    resizeBackground(background);
}

function toggleMute() {
    if (this.sound.mute) {
        this.sound.mute = false;
        muteButton.setText('Mute');
    } else {
        this.sound.mute = true;
        muteButton.setText('Unmute');
    }
}

function stopAndRemoveAllEnemies(scene) {
    // Log for debugging
    console.log('Stopping and removing all enemies');

    // Ensure enemies group exists and has children
    if (scene.enemies && scene.enemies.children) {
        // Stop the enemy spawn timer
        if (enemySpawnTimer) {
            enemySpawnTimer.remove();
        }

        // Stop and remove all enemies
        scene.enemies.children.iterate(function (enemy) {
            if (enemy) {
                if (enemy.anims) {
                    enemy.anims.stop();
                }
                enemy.disableBody(true, true);
                enemy.destroy(); // Explicitly destroy the enemy
            } else {
                console.warn('Encountered undefined enemy');
            }
        });
    } else {
        console.warn('Enemies group is undefined or has no children');
    }
}
