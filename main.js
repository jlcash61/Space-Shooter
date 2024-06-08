const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

function preload() {
    console.log('Preload called');
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
    this.load.image('enemy', 'images/enemy.png');
    this.load.image('bullet', 'images/bullet.png');
}

function create() {
    console.log('Create called');
    // Scrollable background
    background = this.add.tileSprite(400, 300, 800, 600, 'background');
    background.setScrollFactor(0);

    // Player ship
    player = this.physics.add.sprite(400, 500, 'player_frame1');
    player.setCollideWorldBounds(true);
    player.setScale(0.1);

    // Bullets group
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 20
    });

    // Enemies group
    enemies = this.physics.add.group();

    // Timer for spawning enemies
    this.time.addEvent({
        delay: 1000, // spawn enemy every 1 second
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });

    // Controls
    cursors = this.input.keyboard.createCursorKeys();

    // Touch input
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

    // Collisions
    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.collider(bullets, enemies, hitEnemyWithBullet, null, this);

    // Animations
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

    player.play('fly');
}

function update(time, delta) {
    console.log('Update called');
    // Scrolling background
    background.tilePositionY -= 2;

    // Player controls
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

    // Shooting bullets
    if (cursors.space.isDown || isTouching) {
        fireBullet(time);
    }

    // Respawn enemies
    enemies.children.iterate(function (child) {
        if (child.y > 600) {
            child.y = 0;
            child.x = Phaser.Math.Between(0, 800);
        }
    });

    // Deactivate bullets that go off screen
    bullets.children.iterate(function (bullet) {
        if (bullet.active && bullet.y < 0) {
            console.log(`Deactivating bullet at y=${bullet.y}`);
            bullet.disableBody(true, true);
        }
    });
}

function spawnEnemy() {
    console.log('Spawn enemy');
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(-50, -10); // spawn slightly off-screen
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setScale(0.15);
    enemy.setVelocityY(100);
}

function fireBullet(time) {
    if (time > bulletTime) {
        console.log('Fire bullet');
        let bullet = bullets.get();

        if (bullet) {
            bullet.enableBody(false, bullet.x, bullet.y, true, true);
            bullet.setPosition(player.x, player.y - 20);
            bullet.setVelocityY(-300);
            bullet.setScale(0.1);
            console.log(`Fired bullet at x=${player.x}, y=${player.y - 20}`);
            bulletTime = time + 250; // Adjusted firing rate
        }
    }
}

function movePlayer(x, y) {
    player.setPosition(x, y);
}

function hitEnemy(player, enemy) {
    console.log('Hit enemy');
    player.setTint(0xff0000);
    this.physics.pause(); // Pause the physics engine
    this.time.paused = true; // Stop all timed events
}

function hitEnemyWithBullet(bullet, enemy) {
    console.log('Bullet hit enemy');
    bullet.disableBody(true, true);
    enemy.disableBody(true, true);
}
