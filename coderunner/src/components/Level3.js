import React, { useEffect } from 'react';
import Phaser from 'phaser';

// Define the Phaser Scene as a class
class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3Scene' });
    this.duck = null;
    this.cursors = null;
    this.hearts = null;
    this.timerText = null;
    this.timerValue = 30;
    this.coinsCollected = 0;
    this.life = 3;
    this.platforms = null;
    this.memoryTowers = null;
    this.timePortals = null;
    this.glitches = null;
    this.asokan = null;
    this.gameWon = false;
    this.isSpeedBoosted = false;
    this.portalQueue = [];
    this.nextPortalIndex = 0;
    this.gameInstance = null; // Store the game instance
    this.onBack = null; // Store the onBack prop
  }

  init(data) {
    // Retrieve game and onBack from the data passed during scene initialization
    this.gameInstance = data.game;
    this.onBack = data.onBack;
  }

  preload() {
    this.load.image('duck', 'assets/duck.png');
    this.load.image('heart', 'assets/heart2.png');
    this.load.image('coin', 'assets/coin2.png');
    this.load.image('glitch', 'assets/code_bug.png');
    this.load.image('platform', 'assets/node.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('flag', 'assets/flag.png');
    this.load.image('asokan', 'assets/asokan_sage.png');
    this.load.image('portal', 'assets/portal.png');
    this.load.audio('level3Music', 'assets/level3_music.mp3');
    this.load.audio('jumpSound', 'assets/jump_sound.mp3');
    this.load.audio('collectSound', 'assets/collect_sound.mp3');
    this.load.audio('bugSound', 'assets/bug_sound.mp3');
  }

  create() {
    const scene = this;

    const graphics = scene.add.graphics();
    graphics.fillGradientStyle(0x1e3a8a, 0x1e3a8a, 0x6b21a8, 0x6b21a8, 1);
    graphics.fillRect(0, 0, 5000, 735);

    const ground = scene.physics.add.staticGroup();
    for (let x = 0; x < 5000; x += 48) {
      let tile = ground.create(x, 735, 'ground').setOrigin(0, 1);
      tile.setScale(1).refreshBody();
    }

    this.duck = scene.physics.add.sprite(100, 635, 'duck').setScale(0.2);
    this.duck.setBounce(0.2);
    this.duck.setCollideWorldBounds(true);
    scene.physics.add.collider(this.duck, ground);

    this.platforms = scene.physics.add.staticGroup();
    const platformData = [
      { x: 300, y: 600 },
      { x: 500, y: 500 },
      { x: 700, y: 600 },
      { x: 1100, y: 600 },
      { x: 1500, y: 600 },
      { x: 1700, y: 500 },
      { x: 1900, y: 600 },
      { x: 2300, y: 600 },
      { x: 2500, y: 400 },
      { x: 2700, y: 600 },
      { x: 3100, y: 600 },
    ];

    platformData.forEach((platform) => {
      let p = this.platforms.create(platform.x, platform.y, 'platform');
      p.setScale(0.2);
      p.refreshBody();
      p.body.setCircle((p.displayWidth * 0.9) / 2);
      p.body.setOffset((p.displayWidth * 0.1) / 2, (p.displayHeight * 0.1) / 2);
    });

    scene.physics.add.collider(this.duck, this.platforms);

    this.hearts = scene.add.group({
      key: 'heart',
      repeat: 2,
      setXY: { x: 20, y: 20, stepX: 40 },
    });
    this.hearts.children.iterate((heart) => heart.setScrollFactor(0));

    this.timerText = scene.add.text(720, 20, `Time: ${this.timerValue}`, { fontSize: '24px', fill: '#fff' });
    this.timerText.setScrollFactor(0);

    scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timerValue--;
        this.timerText.setText(`Time: ${this.timerValue}`);
        if (this.timerValue === 0) {
          this.timeUp();
        }
      },
      loop: true,
    });

    this.memoryTowers = scene.physics.add.staticGroup();
    const towerData = [
      { x: 900, count: 3, baseY: 600 },
      { x: 1900, count: 4, baseY: 600 },
      { x: 2700, count: 3, baseY: 600 },
    ];

    towerData.forEach((towerInfo) => {
      const stack = [];
      for (let i = 0; i < towerInfo.count; i++) {
        const yPosition = towerInfo.baseY - (i * 40);
        let tower = this.memoryTowers.create(towerInfo.x, yPosition, 'platform');
        tower.setScale(0.2);
        tower.refreshBody();
        tower.body.setCircle((tower.displayWidth * 0.9) / 2);
        tower.body.setOffset((tower.displayWidth * 0.1) / 2, (tower.displayHeight * 0.1) / 2);
        tower.stack = stack;
        if (i === 0) {
          tower.setTint(0x00ff00);
        } else {
          tower.setTint(0xff0000);
        }
        stack.push(tower);
      }
    });

    scene.physics.add.collider(this.duck, this.memoryTowers, (...args) => this.hitMemoryTower(...args), null, scene);

    this.timePortals = scene.physics.add.staticGroup();
    const portalData = [
      { x: 700, y: 500, order: 0, nextX: 1100, nextY: 500 },
      { x: 1500, y: 500, order: 1, nextX: 1900, nextY: 500 },
      { x: 2300, y: 500, order: 2, nextX: 2700, nextY: 500 },
    ];

    portalData.forEach((portalInfo, index) => {
      let portal = this.timePortals.create(portalInfo.x, portalInfo.y, 'portal');
      portal.setScale(0.5);
      portal.body.allowGravity = false;
      portal.portalId = portalInfo.order;
      portal.nextX = portalInfo.nextX;
      portal.nextY = portalInfo.nextY;
      this.portalQueue.push(portalInfo.order);
      const orderText = scene.add.text(portal.x, portal.y - 30, `${index + 1}`, {
        fontSize: '20px',
        fill: '#ffffff',
        stroke: '#000',
        strokeThickness: 3,
      });
      orderText.setOrigin(0.5, 0.5);
    });

    scene.physics.add.overlap(this.duck, this.timePortals, (...args) => this.enterTimePortal(...args), null, scene);

    this.glitches = scene.physics.add.group();
    const glitchData = [
      { x: 400, y: 600 },
      { x: 800, y: 600 },
      { x: 1200, y: 600 },
      { x: 1600, y: 600 },
      { x: 2000, y: 600 },
      { x: 2400, y: 600 },
      { x: 2800, y: 600 },
    ];

    glitchData.forEach((glitch) => {
      let g = this.glitches.create(glitch.x, glitch.y, 'glitch');
      g.setScale(0.03);
      g.body.allowGravity = false;
      g.direction = 1;
      g.setVelocityX(g.direction * 80);
      g.startX = g.x;
      g.moveDistance = 100;
      scene.time.addEvent({
        delay: 2000,
        callback: () => {
          if (!g.active) return;
          g.direction *= -1;
          g.setVelocityX(g.direction * 80);
        },
        loop: true,
      });
    });

    scene.physics.add.collider(this.glitches, this.platforms);
    scene.physics.add.collider(this.glitches, ground);
    scene.physics.add.collider(this.duck, this.glitches, (...args) => this.hitGlitch(...args), null, scene);

    this.asokan = scene.add.sprite(3500, 635, 'asokan').setScale(0.4);
    scene.tweens.add({
      targets: this.asokan,
      y: this.asokan.y - 20,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
    scene.physics.add.overlap(this.duck, this.asokan, (...args) => this.checkWin(...args), null, scene);

    const music = scene.sound.add('level3Music', { loop: true, volume: 0.5 });
    music.play();

    scene.cameras.main.setBounds(0, 0, 5000, 735);
    scene.physics.world.setBounds(0, 0, 5000, 735);
    scene.cameras.main.startFollow(this.duck, true, 0.1, 0.1);

    this.cursors = scene.input.keyboard.createCursorKeys();

    const backButton = scene.add.graphics();
    backButton.fillStyle(0xf44336, 1);
    backButton.fillRoundedRect(20, 60, 120, 40, 8);
    backButton.lineStyle(2, 0xFFFFFF, 1);
    backButton.strokeRoundedRect(20, 60, 120, 40, 8);
    backButton.setScrollFactor(0);
    backButton.setInteractive(new Phaser.Geom.Rectangle(20, 60, 120, 40), Phaser.Geom.Rectangle.Contains);

    const backText = scene.add.text(80, 80, 'Back', {
      fontSize: '20px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5, 0.5);
    backText.setScrollFactor(0);

    backButton.on('pointerover', function () {
      backButton.clear();
      backButton.fillStyle(0xef5350, 1);
      backButton.fillRoundedRect(20, 60, 120, 40, 8);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(20, 60, 120, 40, 8);
    });

    backButton.on('pointerout', function () {
      backButton.clear();
      backButton.fillStyle(0xf44336, 1);
      backButton.fillRoundedRect(20, 60, 120, 40, 8);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(20, 60, 120, 40, 8);
    });

    backButton.on('pointerdown', () => {
      this.gameInstance.input.enabled = false;
      setTimeout(() => {
        if (typeof this.onBack === 'function') {
          this.onBack();
        } else {
          console.warn('onBack is not a function in Level3.js (create)');
        }
      }, 0);
    });
  }

  hitMemoryTower(duck, tower) {
    let duckBottom = duck.body.y + duck.body.height;
    let towerTop = tower.body.y;

    const topPlatform = tower.stack.reduce((top, p) => 
      p.active && (!top || p.y < top.y) ? p : top, null);

    if (tower === topPlatform && duckBottom <= towerTop + 10) {
      tower.setTint(0x00ff00);
      this.time.delayedCall(500, () => {
        tower.destroy();
        this.coinsCollected += 1;
        const scoreText = this.add.text(tower.x, tower.y - 20, '+1', {
          fontSize: '16px',
          fill: '#00ff00',
          stroke: '#000',
          strokeThickness: 3,
          fontStyle: 'bold',
        });
        this.tweens.add({
          targets: scoreText,
          y: scoreText.y - 30,
          alpha: 0,
          duration: 800,
          onComplete: () => {
            scoreText.destroy();
          },
        });
      });
    } else if (tower !== topPlatform) {
      this.life--;
      if (this.life >= 0) {
        this.hearts.children.entries[this.life].setVisible(false);
      }
      this.duck.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.duck.clearTint();
      });
      if (this.life <= 0) {
        this.gameOver();
      }
      tower.body.checkCollision.up = false;
      this.time.delayedCall(500, () => {
        tower.body.checkCollision.up = true;
      });
    }
  }

  enterTimePortal(duck, portal) {
    const portalId = portal.portalId;

    if (portalId === this.portalQueue[this.nextPortalIndex]) {
      portal.destroy();
      this.coinsCollected += 2;
      this.nextPortalIndex++;
      
      if (this.nextPortalIndex === this.portalQueue.length) {
        this.isSpeedBoosted = true;
        const originalSpeed = 160;
        this.duck.setVelocityX(this.duck.body.velocity.x > 0 ? originalSpeed * 2 : this.duck.body.velocity.x < 0 ? -originalSpeed * 2 : 0);
        this.time.delayedCall(10000, () => {
          this.isSpeedBoosted = false;
          this.duck.setVelocityX(this.duck.body.velocity.x > 0 ? originalSpeed : this.duck.body.velocity.x < 0 ? -originalSpeed : 0);
        });
      }

      const scoreText = this.add.text(portal.x, portal.y - 20, '+2', {
        fontSize: '16px',
        fill: '#00ff00',
        stroke: '#000',
        strokeThickness: 3,
        fontStyle: 'bold',
      });
      this.tweens.add({
        targets: scoreText,
        y: scoreText.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          scoreText.destroy();
        },
      });

      this.duck.setPosition(portal.nextX, portal.nextY);
    } else {
      this.life--;
      if (this.life >= 0) {
        this.hearts.children.entries[this.life].setVisible(false);
      }
      this.duck.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.duck.clearTint();
      });
      if (this.life <= 0) {
        this.gameOver();
      }
    }
  }

  hitGlitch(duck, glitch) {
    let duckBottom = duck.body.y + duck.body.height;
    let glitchTop = glitch.body.y;

    if (duckBottom <= glitchTop + 10 && duck.body.velocity.y > 0) {
      glitch.destroy();
      this.coinsCollected += 1;
      const scoreText = this.add.text(glitch.x, glitch.y - 20, '+1', {
        fontSize: '16px',
        fill: '#00ff00',
        stroke: '#000',
        strokeThickness: 3,
        fontStyle: 'bold',
      });
      this.tweens.add({
        targets: scoreText,
        y: scoreText.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          scoreText.destroy();
        },
      });
    } else {
      this.life--;
      if (this.life >= 0) {
        this.hearts.children.entries[this.life].setVisible(false);
      }
      this.duck.setTint(0xff0000);
      this.time.delayedCall(1000, () => {
        this.duck.clearTint();
      });
      if (this.life <= 0) {
        this.gameOver();
      }
    }
  }

  checkWin(duck, asokan) {
    if (this.gameWon) return;
    if (duck.x >= asokan.x) {
      this.gameWon = true;
      this.physics.pause();
      this.showVictoryModal();
    }
  }

  update() {
    const speed = this.isSpeedBoosted ? 320 : 160;
    if (this.cursors.left.isDown) {
      this.duck.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.duck.setVelocityX(speed);
    } else {
      this.duck.setVelocityX(0);
    }
    if (this.cursors.up.isDown && this.duck.body.touching.down) {
      this.duck.setVelocityY(-360);
      this.sound.play('jumpSound', { volume: 0.5 });
    }
  }

  gameOver() {
    this.duck.setTint(0xff0000);
    this.physics.pause();
    const modalWidth = 600;
    const modalHeight = 400;
    const modalX = (this.cameras.main.width / 2) - (modalWidth / 2);
    const modalY = (this.cameras.main.height / 2) - (modalHeight / 2);
    const modal = this.add.graphics();
    modal.fillStyle(0x330000, 0.9);
    modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    modal.lineStyle(4, 0xff0000, 1);
    modal.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    modal.setScrollFactor(0);
    const headerText = this.add.text(modalX + 300, modalY + 80, 'Game Over!', {
      fontSize: '40px',
      fontFamily: 'Arial',
      fill: '#ff0000',
      fontStyle: 'bold',
    });
    headerText.setOrigin(0.5, 0.5);
    headerText.setScrollFactor(0);
    const coinsText = this.add.text(modalX + 300, modalY + 180, `Coins: ${this.coinsCollected}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      fill: '#ffffff',
    });
    coinsText.setOrigin(0.5, 0.5);
    coinsText.setScrollFactor(0);
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = modalX + 300 - (buttonWidth / 2);
    const buttonY = modalY + 300 - (buttonHeight / 2);
    const replayButton = this.add.graphics();
    replayButton.fillStyle(0x4CAF50, 1);
    replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    replayButton.lineStyle(2, 0xFFFFFF, 1);
    replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    replayButton.setScrollFactor(0);
    replayButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    const replayText = this.add.text(buttonX + 100, buttonY + 30, 'TRY AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold',
    });
    replayText.setOrigin(0.5, 0.5);
    replayText.setScrollFactor(0);
    replayButton.on('pointerover', function () {
      replayButton.clear();
      replayButton.fillStyle(0x66BB6A, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    });
    replayButton.on('pointerout', function () {
      replayButton.clear();
      replayButton.fillStyle(0x4CAF50, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    });
    replayButton.on('pointerdown', () => {
      this.life = 3;
      this.coinsCollected = 0;
      this.timerValue = 30;
      this.isSpeedBoosted = false;
      this.portalQueue = [];
      this.nextPortalIndex = 0;
      this.scene.restart();
    });
    const backButton = this.add.graphics();
    const backButtonX = modalX + 300 - (buttonWidth / 2);
    const backButtonY = modalY + 380 - (buttonHeight / 2);
    backButton.fillStyle(0xf44336, 1);
    backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    backButton.lineStyle(2, 0xFFFFFF, 1);
    backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    backButton.setScrollFactor(0);
    backButton.setInteractive(new Phaser.Geom.Rectangle(backButtonX, backButtonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    const backText = this.add.text(backButtonX + 100, backButtonY + 30, 'BACK TO HOME', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5, 0.5);
    backText.setScrollFactor(0);
    backButton.on('pointerover', function () {
      backButton.clear();
      backButton.fillStyle(0xef5350, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    });
    backButton.on('pointerout', function () {
      backButton.clear();
      backButton.fillStyle(0xf44336, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    });
    backButton.on('pointerdown', () => {
      this.gameInstance.input.enabled = false;
      setTimeout(() => {
        if (typeof this.onBack === 'function') {
          this.onBack();
        } else {
          console.warn('onBack is not a function in Level3.js (gameOver)');
        }
      }, 0);
    });
  }

  showVictoryModal() {
    const modalWidth = 600;
    const modalHeight = 400;
    const modalX = (this.cameras.main.width / 2) - (modalWidth / 2);
    const modalY = (this.cameras.main.height / 2) - (modalHeight / 2);
    const modal = this.add.graphics();
    modal.fillStyle(0x000033, 1);
    modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    modal.lineStyle(4, 0xffff00, 1);
    modal.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
    modal.setScrollFactor(0);
    const headerText = this.add.text(modalX + 300, modalY + 80, 'Level 3 Complete!', {
      fontSize: '40px',
      fontFamily: 'Arial',
      fill: '#FFD700',
      fontStyle: 'bold',
    });
    headerText.setOrigin(0.5, 0.5);
    headerText.setScrollFactor(0);
    const scoreText = this.add.text(modalX + 300, modalY + 180, `Score: ${this.coinsCollected}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      fill: '#ffffff',
    });
    scoreText.setOrigin(0.5, 0.5);
    scoreText.setScrollFactor(0);
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = modalX + 300 - (buttonWidth / 2);
    const buttonY = modalY + 300 - (buttonHeight / 2);
    const replayButton = this.add.graphics();
    replayButton.fillStyle(0x4CAF50, 1);
    replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    replayButton.lineStyle(2, 0xFFFFFF, 1);
    replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    replayButton.setScrollFactor(0);
    replayButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    const replayText = this.add.text(buttonX + 100, buttonY + 30, 'PLAY AGAIN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold',
    });
    replayText.setOrigin(0.5, 0.5);
    replayText.setScrollFactor(0);
    replayButton.on('pointerover', function () {
      replayButton.clear();
      replayButton.fillStyle(0x66BB6A, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    });
    replayButton.on('pointerout', function () {
      replayButton.clear();
      replayButton.fillStyle(0x4CAF50, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
    });
    replayButton.on('pointerdown', () => {
      this.gameWon = false;
      this.life = 3;
      this.coinsCollected = 0;
      this.timerValue = 30;
      this.isSpeedBoosted = false;
      this.portalQueue = [];
      this.nextPortalIndex = 0;
      this.scene.restart();
    });
    const backButton = this.add.graphics();
    const backButtonX = modalX + 300 - (buttonWidth / 2);
    const backButtonY = modalY + 380 - (buttonHeight / 2);
    backButton.fillStyle(0xf44336, 1);
    backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    backButton.lineStyle(2, 0xFFFFFF, 1);
    backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    backButton.setScrollFactor(0);
    backButton.setInteractive(new Phaser.Geom.Rectangle(backButtonX, backButtonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    const backText = this.add.text(backButtonX + 100, backButtonY + 30, 'BACK TO HOME', {
      fontSize: '24px',
      fontFamily: 'Arial',
      fill: '#ffffff',
      fontStyle: 'bold',
    });
    backText.setOrigin(0.5, 0.5);
    backText.setScrollFactor(0);
    backButton.on('pointerover', function () {
      backButton.clear();
      backButton.fillStyle(0xef5350, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    });
    backButton.on('pointerout', function () {
      backButton.clear();
      backButton.fillStyle(0xf44336, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
    });
    backButton.on('pointerdown', () => {
      this.gameInstance.input.enabled = false;
      setTimeout(() => {
        if (typeof this.onBack === 'function') {
          this.onBack();
        } else {
          console.warn('onBack is not a function in Level3.js (showVictoryModal)');
        }
      }, 0);
    });
  }

  timeUp() {
    this.tweens.add({
      targets: this.asokan,
      x: this.duck.x,
      y: this.duck.y,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.gameWon = true;
        this.physics.pause();
        if (typeof this.onBack === 'function') {
          this.onBack();
        } else {
          console.warn('onBack is not a function in Level3.js (timeUp). Cannot navigate back to home.');
        }
      },
    });
  }
}

const Level3 = ({ onBack }) => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1536,
      height: 735,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false },
      },
      parent: 'level3-canvas',
      scene: Level3Scene,
    };

    const game = new Phaser.Game(config);

    // Pass game and onBack to the scene
    game.scene.start('Level3Scene', { game: game, onBack: onBack });

    return () => {
      if (game.input) {
        game.input.enabled = false;
      }
      game.destroy(true);
    };
  }, [onBack]);

  return <div id="level3-canvas" style={{ width: '1536px', height: '735px', margin: '0 auto' }}></div>;
};

export default Level3;