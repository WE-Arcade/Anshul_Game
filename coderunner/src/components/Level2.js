import React, { useEffect } from 'react';
import Phaser from 'phaser';

const Level2 = ({ onBack }) => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1536,
      height: 735,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false },
      },
      parent: 'level2-canvas',
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);

    let duck, cursors, hearts, timerText, timerValue = 30;
    let coinsCollected = 0;
    let life = 3, resultString = '';
    let platforms, characters, bugs, asokan;
    let gameWon = false;

    function preload() {
      this.load.image('duck', 'assets/duck.png');
      this.load.image('heart', 'assets/heart2.png');
      this.load.image('coin', 'assets/coin2.png');
      this.load.image('bug', 'assets/code_bug.png');
      this.load.image('block', 'assets/block.png');
      this.load.image('node', 'assets/node.png');
      this.load.image('ground', 'assets/ground.png');
      this.load.image('flag', 'assets/flag.png');
      this.load.image('asokan', 'assets/asokan_sage.png');
      this.load.audio('level2Music', 'assets/level2_music.mp3');
      this.load.audio('jumpSound', 'assets/jump_sound.mp3');
      this.load.audio('collectSound', 'assets/collect_sound.mp3');
      this.load.audio('bugSound', 'assets/bug_sound.mp3');
    }

    function gameOver(scene) {
      duck.setTint(0xff0000);
      scene.physics.pause();
      const modalWidth = 600;
      const modalHeight = 400;
      const modalX = (scene.cameras.main.width / 2) - (modalWidth / 2);
      const modalY = (scene.cameras.main.height / 2) - (modalHeight / 2);
      const modal = scene.add.graphics();
      modal.fillStyle(0x330000, 0.9);
      modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
      modal.lineStyle(4, 0xff0000, 1);
      modal.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
      modal.setScrollFactor(0);
      const headerText = scene.add.text(modalX + 300, modalY + 80, 'Game Over!', {
        fontSize: '40px',
        fontFamily: 'Arial',
        fill: '#ff0000',
        fontStyle: 'bold',
      });
      headerText.setOrigin(0.5, 0.5);
      headerText.setScrollFactor(0);
      const coinsText = scene.add.text(modalX + 300, modalY + 180, `Leetcode Coins: ${coinsCollected}`, {
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
      const replayButton = scene.add.graphics();
      replayButton.fillStyle(0x4CAF50, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.setScrollFactor(0);
      replayButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      const replayText = scene.add.text(buttonX + 100, buttonY + 30, 'TRY AGAIN', {
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
      replayButton.on('pointerdown', function () {
        life = 3;
        coinsCollected = 0;
        resultString = '';
        timerValue = 30;
        scene.scene.restart();
      });
      const backButton = scene.add.graphics();
      const backButtonX = modalX + 300 - (buttonWidth / 2);
      const backButtonY = modalY + 380 - (buttonHeight / 2);
      backButton.fillStyle(0xf44336, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.setScrollFactor(0);
      backButton.setInteractive(new Phaser.Geom.Rectangle(backButtonX, backButtonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      const backText = scene.add.text(backButtonX + 100, backButtonY + 30, 'BACK TO HOME', {
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
      backButton.on('pointerdown', function () {
        game.input.enabled = false;
        setTimeout(() => {
          if (typeof onBack === 'function') {
            onBack();
          } else {
            console.warn('onBack is not a function in Level2.js (gameOver)');
          }
        }, 0);
      });
    }

    function showVictoryModal(scene) {
      const modalWidth = 600;
      const modalHeight = 400;
      const modalX = (scene.cameras.main.width / 2) - (modalWidth / 2);
      const modalY = (scene.cameras.main.height / 2) - (modalHeight / 2);
      const modal = scene.add.graphics();
      modal.fillStyle(0x000033, 1);
      modal.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
      modal.lineStyle(4, 0xffff00, 1);
      modal.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 16);
      modal.setScrollFactor(0);
      const headerText = scene.add.text(modalX + 300, modalY + 80, 'Level 2 Complete!', {
        fontSize: '40px',
        fontFamily: 'Arial',
        fill: '#FFD700',
        fontStyle: 'bold',
      });
      headerText.setOrigin(0.5, 0.5);
      headerText.setScrollFactor(0);
      const coinsText = scene.add.text(modalX + 300, modalY + 180, `Leetcode Coins: ${coinsCollected}`, {
        fontSize: '28px',
        fontFamily: 'Arial',
        fill: '#ffffff',
      });
      coinsText.setOrigin(0.5, 0.5);
      coinsText.setScrollFactor(0);
      const stringText = scene.add.text(modalX + 300, modalY + 230, `Collected String: ${resultString}`, {
        fontSize: '28px',
        fontFamily: 'Arial',
        fill: '#ffffff',
      });
      stringText.setOrigin(0.5, 0.5);
      stringText.setScrollFactor(0);
      const buttonWidth = 200;
      const buttonHeight = 60;
      const buttonX = modalX + 300 - (buttonWidth / 2);
      const buttonY = modalY + 300 - (buttonHeight / 2);
      const replayButton = scene.add.graphics();
      replayButton.fillStyle(0x4CAF50, 1);
      replayButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.lineStyle(2, 0xFFFFFF, 1);
      replayButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12);
      replayButton.setScrollFactor(0);
      replayButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      const replayText = scene.add.text(buttonX + 100, buttonY + 30, 'PLAY AGAIN', {
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
      replayButton.on('pointerdown', function () {
        gameWon = false;
        life = 3;
        coinsCollected = 0;
        resultString = '';
        timerValue = 30;
        scene.scene.restart();
      });
      const backButton = scene.add.graphics();
      const backButtonX = modalX + 300 - (buttonWidth / 2);
      const backButtonY = modalY + 380 - (buttonHeight / 2); // Fixed: Changed backButtonHeight to buttonHeight
      backButton.fillStyle(0xf44336, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.lineStyle(2, 0xFFFFFF, 1);
      backButton.strokeRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, 12);
      backButton.setScrollFactor(0);
      backButton.setInteractive(new Phaser.Geom.Rectangle(backButtonX, backButtonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      const backText = scene.add.text(backButtonX + 100, backButtonY + 30, 'BACK TO HOME', {
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
      backButton.on('pointerdown', function () {
        game.input.enabled = false;
        setTimeout(() => {
          if (typeof onBack === 'function') {
            onBack();
          } else {
            console.warn('onBack is not a function in Level2.js (showVictoryModal)');
          }
        }, 0);
      });
    }

    function timeUp(scene) {
      scene.tweens.add({
        targets: asokan,
        x: duck.x,
        y: duck.y,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          gameWon = true;
          scene.physics.pause();
          if (typeof onBack === 'function') {
            onBack();
          } else {
            console.warn('onBack is not a function in Level2.js (timeUp). Cannot navigate back to home.');
          }
        }
      });
    }

    function hitPlatform(scene, duck, platform) {
      if (platform.texture.key === 'block') {
        let duckBottom = duck.body.y + duck.body.height;
        let platformTop = platform.body.y;
        if (duckBottom <= platformTop + 10) {
          platform.destroy();
          coinsCollected += 1; // Award a coin directly
          scene.resultText.setText(`String: ${resultString}`); // Update result text (optional, no coins displayed)
        }
      }
    }

    function hitBug(scene, duck, bug) {
      bug.destroy();
      scene.sound.play('bugSound', { volume: 0.5 });
      life--; // Deduct a heart directly
      if (life >= 0) {
        hearts.children.entries[life].setVisible(false);
      }
      if (life <= 0) {
        gameOver(scene);
      }
    }

    function collectCharacter(scene, duck, char) {
      char.disableBody(true, true);
      resultString += char.char;
      scene.resultText.setText(`String: ${resultString}`);
      scene.sound.play('collectSound', { volume: 0.5 });
    }

    function checkWin(scene, duck, asokan) {
      if (gameWon) return;
      if (duck.x >= asokan.x) {
        gameWon = true;
        scene.physics.pause();
        showVictoryModal(scene);
      }
    }

    function create() {
      const scene = this;

      const graphics = scene.add.graphics();
      graphics.fillGradientStyle(0x1e3a8a, 0x1e3a8a, 0x6b21a8, 0x6b21a8, 1);
      graphics.fillRect(0, 0, 5000, 735);

      const ground = scene.physics.add.staticGroup();
      for (let x = 0; x < 5000; x += 48) {
        let tile = ground.create(x, 735, 'ground').setOrigin(0, 1);
        tile.setScale(1).refreshBody();
      }

      duck = scene.physics.add.sprite(100, 635, 'duck').setScale(0.2);
      duck.setBounce(0.2);
      duck.setCollideWorldBounds(true);
      scene.physics.add.collider(duck, ground);

      platforms = scene.physics.add.staticGroup();
      const platformData = [
        { x: 300, y: 600, type: 'node' },
        { x: 500, y: 500, type: 'block' },
        { x: 700, y: 600, type: 'node' },
        { x: 900, y: 450, type: 'block' },
        { x: 1100, y: 600, type: 'node' },
        { x: 1300, y: 400, type: 'block' },
        { x: 1500, y: 600, type: 'node' },
        { x: 1700, y: 500, type: 'block' },
        { x: 1900, y: 600, type: 'node' },
        { x: 2100, y: 450, type: 'block' },
        { x: 2300, y: 600, type: 'node' },
        { x: 2500, y: 400, type: 'block' },
        { x: 2700, y: 600, type: 'node' },
        { x: 2900, y: 500, type: 'block' },
        { x: 3100, y: 600, type: 'node' },
      ];

      platformData.forEach((platform) => {
        let p = platforms.create(platform.x, platform.y, platform.type);
        if (platform.type === 'node') {
          p.setScale(0.2);
          p.refreshBody();
          p.body.setCircle((p.displayWidth * 0.9) / 2);
          p.body.setOffset((p.displayWidth * 0.1) / 2, (p.displayHeight * 0.1) / 2);
        } else {
          p.setScale(1.3);
          p.refreshBody();
        }
      });

      scene.physics.add.collider(duck, platforms, (...args) => hitPlatform(scene, ...args), null, scene);

      hearts = scene.add.group({
        key: 'heart',
        repeat: 2,
        setXY: { x: 20, y: 20, stepX: 40 },
      });
      hearts.children.iterate((heart) => heart.setScrollFactor(0));

      scene.resultText = scene.add.text(1400, 20, `String: ${resultString}`, { fontSize: '24px', fill: '#fff' });
      scene.resultText.setScrollFactor(0);

      timerText = scene.add.text(720, 20, `Time: ${timerValue}`, { fontSize: '24px', fill: '#fff' });
      timerText.setScrollFactor(0);

      scene.time.addEvent({
        delay: 1000,
        callback: () => {
          timerValue--;
          timerText.setText(`Time: ${timerValue}`);
          if (timerValue === 0) {
            timeUp(scene);
          }
        },
        loop: true,
      });

      characters = scene.physics.add.group({ allowGravity: false, immovable: true });
      const characterData = [
        { x: 400, y: 550, char: 'C' },
        { x: 800, y: 550, char: 'O' },
        { x: 1200, y: 550, char: 'D' },
        { x: 1800, y: 550, char: 'I' },
        { x: 2200, y: 400, char: 'N' },
        { x: 2600, y: 350, char: 'G' },
      ];

      characterData.forEach((char) => {
        let c = characters.create(char.x, char.y, 'coin');
        c.setScale(0.8);
        c.char = char.char;
        scene.tweens.add({
          targets: c,
          y: c.y - 10,
          duration: 1500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      });

      scene.physics.add.overlap(duck, characters, (...args) => collectCharacter(scene, ...args), null, scene);

      bugs = scene.physics.add.group();
      const bugData = [
        { x: 600, y: 600 },
        { x: 800, y: 600 },
        { x: 1000, y: 600 },
        { x: 1400, y: 600 },
        { x: 1600, y: 600 },
        { x: 2000, y: 600 },
        { x: 2400, y: 600 },
        { x: 2800, y: 600 },
      ];

      bugData.forEach((bug) => {
        let b = bugs.create(bug.x, bug.y, 'bug');
        b.setScale(0.03);
        b.setBounce(0.2);
        b.body.allowGravity = false;
        b.direction = 1;
        b.setVelocityX(b.direction * 80);
        b.startX = b.x;
        b.moveDistance = 100;
        scene.time.addEvent({
          delay: 2000,
          callback: () => {
            if (!b.active) return;
            b.direction *= -1;
            b.setVelocityX(b.direction * 80);
          },
          loop: true,
        });
      });

      scene.physics.add.collider(bugs, platforms);
      scene.physics.add.collider(bugs, ground);
      scene.physics.add.collider(duck, bugs, (...args) => hitBug(scene, ...args), null, scene);

      asokan = scene.add.sprite(3500, 635, 'asokan').setScale(0.4);
      scene.tweens.add({
        targets: asokan,
        y: asokan.y - 20,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      scene.physics.add.overlap(duck, asokan, (...args) => checkWin(scene, ...args), null, scene);

      const music = scene.sound.add('level2Music', { loop: true, volume: 0.5 });
      music.play();

      scene.cameras.main.setBounds(0, 0, 5000, 735);
      scene.physics.world.setBounds(0, 0, 5000, 735);
      scene.cameras.main.startFollow(duck, true, 0.1, 0.1);

      cursors = scene.input.keyboard.createCursorKeys();

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

      backButton.on('pointerdown', function () {
        game.input.enabled = false;
        setTimeout(() => {
          if (typeof onBack === 'function') {
            onBack();
          } else {
            console.warn('onBack is not a function in Level2.js (create)');
          }
        }, 0);
      });
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
        duck.setVelocityY(-360);
        this.sound.play('jumpSound', { volume: 0.5 });
      }
    }

    return () => {
      if (game.input) {
        game.input.enabled = false;
      }
      game.destroy(true);
    };
  }, [onBack]);

  return <div id="level2-canvas" style={{ width: '1536px', height: '735px', margin: '0 auto' }}></div>;
};

export default Level2;