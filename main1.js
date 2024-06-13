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
let enemies;
let bullets;
let bulletTime = 0;
let isTouching = false;
let gameOver = false;
let score = 0;
let scoreText;

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
}

function create() {
    background = this.add.tileSprite(400, 300, 800, 600, 'background');
    background.setScrollFactor(0);

    player = this.physics.add.sprite(400, 500, 'player_frame1');
    player.setCollideWorldBounds(true);
    player.setScale(0.1);

    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 20
    });

    enemies = this.physics.add.group();

    this.time.addEvent({
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

    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.collider(bullets, enemies, hitEnemyWithBullet, null, this);

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
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(-50, -10);
    const enemy = enemies.create(x, y, 'enemy_frame1');
    enemy.setScale(0.15);
    enemy.setVelocityY(100);
    enemy.play('EnemyFly');
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
        }
    }
}

function movePlayer(x, y) {
    player.setPosition(x, y);
}

function hitEnemy(player, enemy) {
    player.setTint(0xff0000);
    player.anims.stop();
    player.setTexture('player_hit');
    enemy.anims.stop();
    enemy.setTexture('enemy_hit');
    this.physics.pause();
    this.time.paused = true;
    gameOver = true;
    showGameOverText.call(this);
}

function hitEnemyWithBullet(bullet, enemy) {
    bullet.disableBody(true, true);
    enemy.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);
}

function showGameOverText() {
    const gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#fff' });
    gameOverText.setOrigin(0.5, 0.5);
    const restartText = this.add.text(400, 400, 'Click to Restart', { fontSize: '32px', fill: '#fff' });
    restartText.setOrigin(0.5, 0.5);

    this.input.on('pointerdown', () => {
        this.scene.restart();
        score = 0;
        gameOver = false;
        this.time.paused = false;
        this.physics.resume();
    });
}
