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
let life = 3, timerValue = 120;
var bombs, platforms, stars, books;
let selectedOption = 0, questionActive = false, questionText, answerButtons = [], sage;
let isInvincible = false; //for the duck
let worldHeight = 10000;
let worldWidth = 1536;

let winningPlatform, flag, asokan;
let gameWon = false;

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
    this.load.image('asokan', 'assets/asokan_sage.png');
    this.load.image('flag', 'assets/flag.png');
}

function create() {

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

    // Duck 
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
            let xOffset = (j - 1) * branchWidth + Phaser.Math.Between(0, 50);
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
    this.timerText = this.add.text(720, 20, 'Time: 120', { fontSize: '24px', fill: '#fff' });
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
    let bugSpeed = 60;
    
    // Create bugs on platforms
    let platformsArray = platforms.getChildren();
    // Shuffle the platforms array to randomize which platforms get bugs
    Phaser.Utils.Array.Shuffle(platformsArray);
    
    // Use only 90% of platforms for bugs
    let platformsForBugs = platformsArray.slice(0, Math.floor(platformsArray.length * 0.9));
    
    platformsForBugs.forEach((platform) => {
        let xOffset = Phaser.Math.Between(-50, 50);
        let yOffset = Phaser.Math.Between(-50, -30);
        
        let bug = bugs.create(platform.x + xOffset, platform.y + yOffset, 'bug');
        bug.setScale(0.03);
        bug.setBounce(0.2);
        bug.setCollideWorldBounds(false);
        bug.body.allowGravity = false;
        
        // Set initial direction and velocity
        bug.direction = Phaser.Math.Between(0, 1) ? 1 : -1;
        bug.setVelocityX(bug.direction * bugSpeed);
        
         // Set movement range
         bug.startX = bug.x;
         bug.moveDistance = Phaser.Math.Between(50, 200);
         
         // Add a timer for direction changes
         this.time.addEvent({
             delay: Phaser.Math.Between(1500, 3000),
             callback: () => {
                 if (!bug.active) return; // Skip if bug has been destroyed
                 
                 // Change direction
                 bug.direction *= -1;
                 bug.setVelocityX(bug.direction * bugSpeed);
             },
             loop: true
         });
     });
    
    this.physics.add.collider(bugs, platforms);
    this.physics.add.collider(bugs, ground);
    this.physics.add.collider(duck, bugs, hitBug, null, this);

    this.physics.add.overlap(duck, gemBlocks, askDSAQuestion, null, this);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(duck, true, 0.1, 0.1);
    this.cameras.main.scrollY = worldHeight - this.cameras.main.height;


    // Controls
    cursors = this.input.keyboard.createCursorKeys();

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
    // Pause the physics
    this.physics.pause();
    
    // Store scene reference for later use
    const scene = this;
    
    // Remember gem position and replace it with a node
    let gemX = gem.x;
    let gemY = gem.y;
    gem.destroy();
    
    // Create modal background
    const modalWidth = 700;
    const modalHeight = 300;
    const modalX = (this.cameras.main.width / 2) - (modalWidth / 2);
    const modalY = (this.cameras.main.height / 2) - (modalHeight / 2);
    
    // Create modal background with rounded corners
    const modal = this.add.graphics();
    modal.fillStyle(0x000000, 0.9);
    modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    modal.lineStyle(4, 0xffffff, 1);
    modal.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    
    // Make the modal fixed to the camera
    modal.setScrollFactor(0);
    
    // Add the sage at the top left of the modal
    sage = this.add.image(modalX + 80, modalY + 80, 'sage').setScale(0.4);
    sage.setScrollFactor(0);
    
    // Add header
    const headerText = this.add.text(modalX + 350, modalY + 30, 'Code Challenge!', {
        fontSize: '28px',
        fontFamily: 'Arial',
        fill: '#FFD700',
        fontStyle: 'bold'
    });
    headerText.setOrigin(0.5, 0.5);
    headerText.setScrollFactor(0);
    
    // DSA Tree Questions
    const dsaQuestions = [
        { q: "What is the time complexity of binary search?", a: ["O(n)", "O(log n)", "O(1)"], correct: 1 },
        { q: "Which data structure follows FIFO?", a: ["Stack", "Queue", "Heap"], correct: 1 },
        { q: "What's the worst-case time complexity of quicksort?", a: ["O(n log n)", "O(n²)", "O(n)"], correct: 1 },
        { q: "Which data structure is used for implementing recursion?", a: ["Queue", "Stack", "Array"], correct: 1 },
        { q: "What data structure would you use for breadth-first search?", a: ["Stack", "Queue", "Heap"], correct: 1 }
    ];
    
    // Select a random question
    let randomQ = Phaser.Math.Between(0, dsaQuestions.length - 1);
    let q = dsaQuestions[randomQ];
    
    // Add question text
    questionText = this.add.text(modalX + 350, modalY + 100, q.q, {
        fontSize: '24px',
        fontFamily: 'Arial',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: modalWidth - 80 }
    });
    questionText.setOrigin(0.5, 0.5);
    questionText.setScrollFactor(0);
    
    // Set up the answer buttons
    answerButtons = [];
    questionActive = true;
    selectedOption = 0;

    const buttonWidth = 300; 
    const buttonHeight = 40;
    const buttonBg = [];
    
    q.a.forEach((answer, index) => {
        const yOffset = 160 + (index * 40);
        
        // Create background for each button
        let bg = this.add.graphics();
        bg.fillStyle(index === 0 ? 0x555555 : 0x333333, 1);
        bg.fillRoundedRect(modalX + 350 - (buttonWidth / 2), modalY + yOffset - (buttonHeight / 2), 
                          buttonWidth, buttonHeight, 8);
        bg.setScrollFactor(0);
        buttonBg.push(bg);
    });

    q.a.forEach((answer, index) => {
        const yOffset = 160 + (index * 40);
        
        // Create the text on top of the background
        let btn = this.add.text(modalX + 350, modalY + yOffset, index === 0 ? '➤ ' + answer : '  ' + answer, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        });
        btn.setOrigin(0.5, 0.5);
        btn.setScrollFactor(0);
        
        // Store both text and background
        answerButtons.push({
            text: btn,
            background: buttonBg[index]
        });
    });
    
    const uiElements = [modal, sage, headerText, questionText];
    answerButtons.forEach(btn => {
        uiElements.push(btn.text);
        uiElements.push(btn.background);
    });
    const uiGroup = this.add.group(uiElements);
    
    // Create keyboard event listeners specifically for this modal
    const upKey = this.input.keyboard.addKey('UP');
    const downKey = this.input.keyboard.addKey('DOWN');
    const enterKey = this.input.keyboard.addKey('ENTER');
    
     // Up key handler
     upKey.on('down', function() {
        if (!questionActive) return;
        
        // Update current option style
        answerButtons[selectedOption].text.setText('  ' + q.a[selectedOption]);
        answerButtons[selectedOption].background.fillStyle(0x333333, 1);
        answerButtons[selectedOption].background.fillRoundedRect(
            modalX + 350 - (buttonWidth / 2), 
            modalY + 160 + (selectedOption * 40) - (buttonHeight / 2),
            buttonWidth, buttonHeight, 8
        );
        
        // Change selected option
        selectedOption = (selectedOption - 1 + answerButtons.length) % answerButtons.length;
        
        // Update new selected option style
        answerButtons[selectedOption].text.setText('➤ ' + q.a[selectedOption]);
        answerButtons[selectedOption].background.fillStyle(0x555555, 1);
        answerButtons[selectedOption].background.fillRoundedRect(
            modalX + 350 - (buttonWidth / 2), 
            modalY + 160 + (selectedOption * 40) - (buttonHeight / 2),
            buttonWidth, buttonHeight, 8
        );
    });
    
    // Down key handler
    downKey.on('down', function() {
        if (!questionActive) return;
        
        // Update current option style
        answerButtons[selectedOption].text.setText('  ' + q.a[selectedOption]);
        answerButtons[selectedOption].background.fillStyle(0x333333, 1);
        answerButtons[selectedOption].background.fillRoundedRect(
            modalX + 350 - (buttonWidth / 2), 
            modalY + 160 + (selectedOption * 40) - (buttonHeight / 2),
            buttonWidth, buttonHeight, 8
        );
        
        // Change selected option
        selectedOption = (selectedOption + 1) % answerButtons.length;
        
        // Update new selected option style
        answerButtons[selectedOption].text.setText('➤ ' + q.a[selectedOption]);
        answerButtons[selectedOption].background.fillStyle(0x555555, 1);
        answerButtons[selectedOption].background.fillRoundedRect(
            modalX + 350 - (buttonWidth / 2), 
            modalY + 160 + (selectedOption * 40) - (buttonHeight / 2),
            buttonWidth, buttonHeight, 8
        );
    });
    
    // Enter key handler
    enterKey.on('down', function() {
        if (!questionActive) return;
        questionActive = false;
        
        // Create the feedback message
        let resultText;
        
        if (selectedOption === q.correct) {
            // Correct answer
            coinsCollected += 50;
            scene.coinsText.setText(coinsCollected);
            
            resultText = scene.add.text(modalX + 350, modalY - 50, 'Well done! +50 points', {
                fontSize: '24px',
                fontFamily: 'Arial',
                fill: '#00ff00',
                fontStyle: 'bold',
                backgroundColor: '#000000'
            });
        } else {
            // Wrong answer
            life--;
            if (life >= 0) {
                hearts.children.entries[life].setVisible(false);
            }
            
            resultText = scene.add.text(modalX + 350, modalY - 50, 'Oops! Wrong answer! -1 Heart', {
                fontSize: '24px',
                fontFamily: 'Arial',
                fill: '#ff0000',
                fontStyle: 'bold',
                backgroundColor: '#000000',
            });
        }
        
        resultText.setOrigin(0.5, 0.5);
        resultText.setScrollFactor(0);
        uiGroup.add(resultText);
        
        // Add a delay before closing the modal
        scene.time.delayedCall(1000, function() {
            // Create the node where the gem was
            let newNode = scene.physics.add.staticSprite(gemX, gemY, 'node').setScale(0.2);
            newNode.body.setCircle((newNode.displayWidth * 0.9) / 2); 
            newNode.body.setOffset((newNode.displayWidth * 0.1) / 2, (newNode.displayHeight * 0.1) / 2); 
            scene.physics.add.collider(duck, newNode);
            newNode.refreshBody();
            
            // Destroy all modal elements
            uiGroup.destroy(true);
            
            // Remove the keyboard event listeners created for this modal
            upKey.removeAllListeners();
            downKey.removeAllListeners();
            enterKey.removeAllListeners();
            
            // Resume physics
            scene.physics.resume();
            
            // Check if game over
            if (life <= 0) {
                gameOver(scene);
            }
        });
    });
}
