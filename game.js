const config = {
    type: Phaser.AUTO,
    width: 1536,
    height: 735,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: true }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let duck, cursors, timer, timerText, hearts, coinsCollected = 0;
let life = 3, timerValue = 60;
var bombs, platforms, stars, books;
let selectedOption = 0, questionActive = false, questionText, answerButtons = [], sage;
let isInvincible = false; //for the duck
let worldHeight = 10000;
let worldWidth = 1536;

function preload() {
    this.load.image('sky', 'assets/sky.png'); 
    this.load.image('background', 'assets/sky_background.png'); 
    this.load.image('platform', 'assets/platform.png'); 
    this.load.image('floatingIsland', 'assets/floating_island.png')
    this.load.image('duck', 'assets/duck.png');
    this.load.image('heart', 'assets/heart2.png');
    this.load.image('coin', 'assets/coin2.png');
    this.load.image('book', 'assets/book.png');
    this.load.image('bug', 'assets/code_bug.png');
    this.load.image('sage', 'assets/sage.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('gemBlock', 'assets/gemBlock.png');
    this.load.image('star', 'assets/star.png'); 
    this.load.image('bomb', 'assets/bomb.png'); 
    this.load.image('node', 'assets/node.png'); 
    this.load.image('block', 'assets/block.png'); 
    this.load.image('cloud', 'assets/cloud.png'); 
    this.load.image('ground', 'assets/ground.png');   
}

function create() {

    // this.physics.world.setBounds(0, 0, 1536, worldHeight);
    // this.cameras.main.setBounds(0, 0, 1536, worldHeight);
    
    
    // // Sky Background
    for (let i = 0; i < worldHeight; i += 735) {
        this.add.image(768, i, 'background').setScale(3);
    }

    // ground 
    ground = this.physics.add.staticGroup();
    for (let x = 0; x < worldWidth; x += 48) {
        let tile = ground.create(x, worldHeight , 'ground').setOrigin(0, 1);
        tile.setScale(1).refreshBody();
    }

    // Duck (Player)
    duck = this.physics.add.sprite(100, worldHeight - 100, 'duck').setScale(0.2);
    duck.setBounce(0.2);
    duck.setCollideWorldBounds(true);

    this.physics.add.collider(duck, ground);

    // Platforms (Binary Tree Nodes)
    platforms = this.physics.add.staticGroup();
    let treeLevels = 25;
    let startX = 700, startY = worldHeight - 200, levelGap = 200;
    let branchesPerLevel, branchWidth;

    gemBlocks = this.physics.add.group({ allowGravity: false, immovable: true });
    
    for (let i = 0; i < treeLevels; i++) {
        branchesPerLevel = Phaser.Math.Between(1, 5);
        for (let j = 0; j < branchesPerLevel; j++) {
            if (branchesPerLevel <= 2 ) {
                branchWidth = Phaser.Math.Between(400, 700)
            }
            else{
                branchWidth = Phaser.Math.Between(300, 500);
            }
            let xOffset = (j - 1) * branchWidth + Phaser.Math.Between(-50, 50);
            let yOffset = -levelGap * i;
            let nodeType = Phaser.Math.RND.pick(['node','block', 'floatingIsland', 'gemBlock']);
    
            let platform;
            if (nodeType === 'gemBlock') {
                let gemBlock = gemBlocks.create(startX + xOffset, startY + yOffset, 'gemBlock');
                this.physics.add.overlap(duck, gemBlock, askDSAQuestion, null, this);
            } else {
                // Create a static body for other platforms
                platform = platforms.create(startX + xOffset, startY + yOffset, nodeType);
            }
        
            if (nodeType === 'node') {
                platform.setScale(0.2);
                platform.refreshBody();
                platform.body.setCircle((platform.displayWidth * 0.9) / 2); 
                platform.body.setOffset( (platform.displayWidth * 0.1) / 2, (platform.displayHeight * 0.1) / 2); 
                
                
            }
            if (nodeType === 'floatingIsland') {
                platform.setScale(0.5);
                platform.refreshBody();
                platform.setSize(platform.width * 0.45, platform.height * 0.2);
                platform.setOffset(10, platform.height * 0.06);
            }
            if (nodeType === 'block') {
                platform.setScale(1.3);
                platform.refreshBody();
            }
        } 
    }


    this.physics.add.collider(duck, platforms);
    this.physics.add.collider(duck, gemBlocks);


    // Hearts (Life Bar)
    hearts = this.add.group({
        key: 'heart',
        repeat: 2,
        setXY: { x: 20, y: 20, stepX: 40 }
    });
    hearts.children.iterate((heart) => heart.setScrollFactor(0));

    // Coin UI
    this.add.image(1400, 30, 'coin').setScale(0.8).setScrollFactor(0);
    this.coinsText = this.add.text(1430, 20, '0', { fontSize: '24px', fill: '#fff' });
    this.coinsText.setScrollFactor(0);
    // Timer
    this.timerText = this.add.text(720, 20, 'Time: 60', { fontSize: '24px', fill: '#fff' });
    this.time.addEvent({
        delay: 1000,
        callback: () => {
            timerValue--;
            this.timerText.setText(`Time: ${timerValue}`);
            if (timerValue === 0) gameOver(this);
        },
        loop: true
    });
    this.timerText.setScrollFactor(0);

    stars = this.physics.add.staticGroup();
    books = this.physics.add.staticGroup();
    platforms.children.iterate((platform) => {
        if (Phaser.Math.Between(0, 1)) {
            stars.create(platform.x, platform.y - 30, 'star').setScale(0.1);
        }
        if (Phaser.Math.Between(0, 1)) {
            books.create(platform.x + 50, platform.y - 30, 'book').setScale(0.1);
        }
    });
    this.physics.add.overlap(duck, stars, collectStar, null, this);
    this.physics.add.overlap(duck, books, collectBook, null, this);

    // Bombs (Hazards)
    bombs = this.physics.add.group();
    spawnBomb(this);

    // Code Bugs (Enemies)
    bugs = this.physics.add.group();
    let bugSpeed = 50;
    platforms.children.iterate((platform) => {
        if (Phaser.Math.Between(0, 1)) {
            let bug = bugs.create(platform.x, platform.y - 10, 'bug');
            bug.setScale(0.03);
            bug.setBounce(0.2);
        }
    });
    this.physics.add.collider(bugs, platforms);
    this.physics.add.collider(bugs, ground);
    // this.physics.add.collider(duck, bugs, hitBug, null, this);

    // Moving bugs left and right
    bugs.children.iterate((bug) => {
        this.tweens.add({
            targets: bug,
            x: bug.x + Phaser.Math.Between(100, 200),
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    });

    // this.physics.add.overlap(duck, gemBlocks, askDSAQuestion, null, this);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(duck, true, 0.1, 0.1);
    this.cameras.main.scrollY = worldHeight - this.cameras.main.height;


    // Controls
    cursors = this.input.keyboard.createCursorKeys();

    // for answering DSA Questions
    this.input.keyboard.on('keydown-UP', () => moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => moveSelection(1));
    this.input.keyboard.on('keydown-ENTER', selectAnswer);
}

function collectStar(duck, star) {
    star.disableBody(true, true);
    coinsCollected += 10;
    this.coinsText.setText(coinsCollected);
}

function collectBook(duck, book) {
    book.disableBody(true, true);
    coinsCollected += 20; 
    this.coinsText.setText(coinsCollected);
}

function spawnBomb(scene) {
    let bomb = bombs.create(Phaser.Math.Between(200, 1300), 0, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;

    scene.physics.add.collider(bomb, platforms);
    scene.physics.add.collider(bomb, ground);
    scene.physics.add.collider(duck, bomb, hitBomb, null, scene);

    scene.time.addEvent({
        delay: 12000, // Every 10 seconds, add a new bomb
        callback: () => spawnBomb(scene),
        loop: true
    });
}

function hitBomb(duck, bomb) {
    life--;
    hearts.children.entries[life].setVisible(false);
    
    if (life === 0) {
        this.physics.pause();
        duck.setTint(0xff0000);
        gameOver(this);
    } else {
        duck.setTint(0xff0000);
        this.time.delayedCall(1000, () => duck.clearTint());
    }
}

function update() {
    if (cursors.left.isDown) {
        duck.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        duck.setVelocityX(160);
    } else {
        duck.setVelocityX(0);
    }
    if (cursors.up.isDown && duck.body.touching.down) {
        duck.setVelocityY(-350);
    }
    // // infinite scrolling effect
    // if (duck.y < this.cameras.main.scrollY + 300) {
    //     this.cameras.main.scrollY -= 5;
    // }
}
function hitBug(duck, bug) {
    let duckBottom =duck.body.y + duck.body.height;
    let bugTop =  bug.body.y;

    // Check if the duck is falling and hits the bug from the top
    if (duckBottom <= bugTop + 10 || bug.body.blocked.up) { // Added margin (5 pixels)
        bug.destroy(); // Smash the bug
        duck.setVelocityY(-250); // Bounce slightly upwards
    } else {
        if (!isInvincible) { // Check if duck is NOT invincible
            isInvincible = true; // Make duck temporarily invincible
            life--;
            hearts.children.entries[life].setVisible(false);

            if (life === 0) {
                this.physics.pause();
                duck.setTint(0xff0000);
                gameOver(this);
            } else {
                // Tint red to indicate damage
                duck.setTint(0xff0000);

                // Set a delay for invincibility (1 second)
                this.time.delayedCall(1000, () => {
                    duck.clearTint();
                    isInvincible = false; // Reset invincibility after 1 second
                });
            }
        }
    }
}


// Winning Condition (Reaching Root)
function checkWin() {
    if (duck.y < 280) {
        winGame(this);
    }
}

// Game Over Logic
function gameOver(scene) {
    duck.setTint(0xff0000); 
    scene.add.text(650, 350, 'Game Over!', { fontSize: '40px', fill: '#ff0000' });
    scene.scene.pause();
}

// Win Condition
function winGame(scene) {
    scene.add.text(650, 350, 'You Win!', { fontSize: '40px', fill: '#00ff00' });
    scene.scene.pause();
}

function askDSAQuestion(player, gem) {
    let gemX = gem.x;
    let gemY = gem.y;
    gem.destroy();
    let newNode = this.physics.add.staticSprite(gemX, gemY, 'node').setScale(0.2);
    newNode.body.setCircle((newNode.displayWidth * 0.9) / 2); 
    newNode.body.setOffset( (newNode.displayWidth * 0.1) / 2, (newNode.displayHeight * 0.1) / 2); 
    this.physics.add.collider(duck, newNode);
    newNode.refreshBody();
    let questionText = this.add.text(550, 550, '', { fontSize: '24px', fill: '#fff', backgroundColor: '#000'  });
    sage = this.add.image(750, 500, 'sage').setScale(0.6);

    const dsaQuestions = [
        { q: "What is the time complexity of binary search?", a: ["O(n)", "O(log n)", "O(1)"], correct: 1 },
        { q: "Which DS follows FIFO?", a: ["Stack", "Queue", "Heap"], correct: 1 }
    ];

    let randomQ = Phaser.Math.Between(0, dsaQuestions.length - 1);
    let q = dsaQuestions[randomQ];

    questionText.setText(q.q);
    let buttons = [];

    q.a.forEach((answer, index) => {
        let btn = this.add.text(550, 580 + index * 30, answer, { fontSize: '20px', fill: '#ff0',  backgroundColor: '#333' })
            .setInteractive()
            .on('pointerdown', () => {
                if (index === q.correct) {
                    coinsCollected += 50;
                } else {
                    life--;
                }
                buttons.forEach(b => b.destroy());
                questionText.setText('');
            });
        buttons.push(btn);
    });
}


function moveSelection(direction) {
    if (!questionActive) return;
    answerButtons[selectedOption].setStyle({ backgroundColor: '#333' });
    selectedOption = (selectedOption + direction + answerButtons.length) % answerButtons.length;
    answerButtons[selectedOption].setStyle({ backgroundColor: '#555' });
}

function selectAnswer() {
    if (!questionActive) return;
    
    if (selectedOption === 1) {
        coinsCollected += 50;
    } else {
        life--;
    }
    
    questionText.destroy();
    answerButtons.forEach(btn => btn.destroy());
    answerButtons = [];
    questionActive = false;
    sage.destroy();
}
