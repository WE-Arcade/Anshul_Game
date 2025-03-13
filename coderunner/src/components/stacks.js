// StackQueueGame.jsx - Part 1
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const StackQueueGame = ({ onBack }) => {
  const gameRef = useRef(null);
  const ducklingRef = useRef(null);
  const teacherRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
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
    gameRef.current = game;

    let duckling, teacher, stackItems = [], queueItems = [];
    let stackText, queueText, instructionText, scoreText, gameOverText;
    let stackCapacity = 5, queueCapacity = 5;
    let stackCount = 0, queueCount = 0, score = 0;
    let teacherSpeechBubble, currentLesson = 0;
    let lessonTimer, gameOver = false;
    let backgroundMusic;

    const lessons = [
      "Hello, little duckling! I’m Anshul, your teacher.\nLet’s learn about stacks and queues today!",
      "First, move around! Use A to go left\nand D to go right. Try it now!",
      "Good job! Now, let’s try a stack.\nA stack is like a pile of plates.",
      "Press S to push a food item\nonto the stack. It goes on top!",
      "See how it stacks up? That’s LIFO:\nLast In, First Out. Try S again!",
      "Now press P to pop the top item off.\nIt’s the last one you added!",
      "Great! Next, let’s learn about queues.\nA queue is like a line at the pond.",
      "Press Q to enqueue a food item.\nIt joins the back of the line!",
      "Notice how it lines up? That’s FIFO:\nFirst In, First Out. Try Q again!",
      "Now press R to dequeue the first item.\nIt’s the one that’s been waiting longest!",
      "Perfect! Keep practicing with S, P, Q, and R.\nEarn 100 points to win!"
    ];

    function preload() {
      this.load.image('duckling', '/assets/duck.png');
      this.load.image('teacher', '/assets/sage.png');
      this.load.image('food', '/assets/food.png');
      this.load.image('background', '/assets/sky_background.png');
      this.load.audio('backgroundMusic', '/assets/background_music.mp3');
    }

    // Continued in Part 2...
// StackQueueGame.jsx - Part 2 (continued from Part 1)
function create() {
    this.add.image(0, 0, 'background')
      .setOrigin(0)
      .setDisplaySize(window.innerWidth, window.innerHeight);

    duckling = this.physics.add.sprite(200, window.innerHeight - 200, 'duckling')
      .setScale(0.5)
      .setCollideWorldBounds(true);
    ducklingRef.current = duckling;

    teacher = this.add.sprite(window.innerWidth - 100, window.innerHeight - 200, 'teacher')
      .setScale(0.5);
    teacherRef.current = teacher;

    // Queue: Black fill, yellow outline, horizontal blocks (80x80 each, total 400x80), left to right
    for (let i = 0; i < queueCapacity; i++) {
      this.add.rectangle(window.innerWidth - 550 + i * 80, 150, 80, 80, 0x000000)
        .setStrokeStyle(2, 0xffff00);
    }
    queueText = this.add.text(window.innerWidth - 550, 50, 'Queue: 0/5', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);

    // Stack: Black fill, yellow outline, vertical blocks (80x80 each, total 80x400), bottom to top
    const stackBaseY = 550; // Bottom block at y: 550
    for (let i = 0; i < stackCapacity; i++) {
      this.add.rectangle(150, stackBaseY - i * 80, 80, 80, 0x000000) // Grow upward
        .setStrokeStyle(2, 0xffff00);
    }
    stackText = this.add.text(150, stackBaseY - stackCapacity * 80 - 30, 'Stack: 0/5', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);

    scoreText = this.add.text(window.innerWidth / 2, 20, 'Score: 0', {
      fontSize: '24px', color: '#ffffff'
    }).setOrigin(0.5);

    teacherSpeechBubble = this.add.rectangle(window.innerWidth - 200, window.innerHeight - 300, 300, 120, 0xffffff)
      .setOrigin(0.5)
      .setVisible(false);
    instructionText = this.add.text(window.innerWidth - 200, window.innerHeight - 300, lessons[0], {
      fontSize: '18px', color: '#000000', align: 'center', wordWrap: { width: 280 }
    }).setOrigin(0.5).setVisible(false);

    gameOverText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Game Over! You Win!', {
      fontSize: '48px', color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
    backgroundMusic.play();

    showLesson(this, 0);

    this.input.keyboard.on('keydown-A', () => {
      if (!gameOver) {
        duckling.setVelocityX(-200);
        if (currentLesson === 1) nextLesson(this);
      }
    });
    this.input.keyboard.on('keydown-D', () => {
      if (!gameOver) {
        duckling.setVelocityX(200);
        if (currentLesson === 1) nextLesson(this);
      }
    });
    this.input.keyboard.on('keyup', () => duckling.setVelocityX(0));
    this.input.keyboard.on('keydown-S', () => pushStack(this));
    this.input.keyboard.on('keydown-P', () => popStack(this));
    this.input.keyboard.on('keydown-Q', () => enqueue(this));
    this.input.keyboard.on('keydown-R', () => dequeue(this));
  }

  function showLesson(scene, lessonIndex) {
    if (lessonIndex < lessons.length) {
      if (lessonTimer) scene.time.removeEvent(lessonTimer);
      teacherSpeechBubble.setVisible(true);
      instructionText.setText(lessons[lessonIndex]).setVisible(true);
      scene.tweens.add({
        targets: [teacherSpeechBubble, instructionText],
        scale: { from: 0, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Bounce.easeOut'
      });
      if (lessonIndex === 0 || lessonIndex === 2 || lessonIndex === 6) {
        lessonTimer = scene.time.delayedCall(3000, () => nextLesson(scene), [], scene);
      }
    }
  }

  function hideLesson(scene) {
    scene.tweens.add({
      targets: [teacherSpeechBubble, instructionText],
      scale: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        teacherSpeechBubble.setVisible(false);
        instructionText.setVisible(false);
      }
    });
  }

  function nextLesson(scene) {
    if (currentLesson < lessons.length - 1) {
      hideLesson(scene);
      scene.time.delayedCall(500, () => {
        currentLesson++;
        showLesson(scene, currentLesson);
      }, [], scene);
    }
  }

  // Continued in Part 3...
// StackQueueGame.jsx - Part 3 (continued from Part 2)
function updateScore(points) {
    if (!gameOver) {
      score += points;
      scoreText.setText(`Score: ${score}`);
      this.tweens.add({
        targets: scoreText,
        scale: 1.2,
        duration: 200,
        yoyo: true
      });
      if (score >= 100) {
        gameOver = true;
        gameOverText.setVisible(true);
        backgroundMusic.stop();
        this.tweens.add({
          targets: gameOverText,
          scale: { from: 0, to: 1 },
          duration: 1000,
          ease: 'Bounce.easeOut'
        });
        hideLesson(this);
      }
    }
  }

  function pushStack(scene) {
    if (stackCount < stackCapacity && !gameOver) {
      const stackBaseY = 550;
      const item = scene.physics.add.sprite(150, stackBaseY - (stackCapacity - 1 - stackCount) * 80, 'food')
        .setScale(0.1);
      stackItems.push(item);
      stackCount++;
      stackText.setText(`Stack: ${stackCount}/5`);
      scene.tweens.add({
        targets: item,
        y: stackBaseY - (stackCapacity - 1 - (stackCount - 1)) * 80, // Grow upward
        duration: 500,
        ease: 'Elastic.easeOut'
      });
      if (currentLesson === 3 || currentLesson === 4) nextLesson(scene);
      updateScore.call(scene, 10);
    }
  }

  function popStack(scene) {
    if (stackCount > 0 && !gameOver) {
      const stackBaseY = 550;
      const item = stackItems.pop();
      stackCount--;
      stackText.setText(`Stack: ${stackCount}/5`);
      scene.tweens.add({
        targets: item,
        y: stackBaseY + 50, // Move below stack
        alpha: 0,
        duration: 600,
        ease: 'Back.easeIn',
        onComplete: () => item.destroy()
      });
      if (currentLesson === 5) nextLesson(scene);
      updateScore.call(scene, 10);
    }
  }

  function enqueue(scene) {
    if (queueCount < queueCapacity && !gameOver) {
      const item = scene.physics.add.sprite(window.innerWidth - 550 + queueCount * 80, 150, 'food')
        .setScale(0.1);
      queueItems.push(item);
      queueCount++;
      queueText.setText(`Queue: ${queueCount}/5`);
      scene.tweens.add({
        targets: item,
        x: window.innerWidth - 550 + (queueCount - 1) * 80,
        duration: 400,
        ease: 'Bounce.easeOut'
      });
      if (currentLesson === 7 || currentLesson === 8) nextLesson(scene);
      updateScore.call(scene, 10);
    }
  }

  function dequeue(scene) {
    if (queueCount > 0 && !gameOver) {
      const item = queueItems.shift();
      queueCount--;
      queueText.setText(`Queue: ${queueCount}/5`);
      scene.tweens.add({
        targets: item,
        x: window.innerWidth - 590,
        alpha: 0,
        duration: 600,
        ease: 'Power3.easeIn',
        onComplete: () => {
          item.destroy();
          queueItems.forEach((qItem, index) => {
            scene.tweens.add({
              targets: qItem,
              x: window.innerWidth - 550 + index * 80,
              duration: 300,
              ease: 'Quad.easeOut'
            });
          });
        }
      });
      if (currentLesson === 9) nextLesson(scene);
      updateScore.call(scene, 10);
    }
  }

  function update() {
    if (!gameOver) {
      if (duckling.body.velocity.x !== 0) {
        duckling.flipX = duckling.body.velocity.x < 0;
        duckling.setAngle(Phaser.Math.RadToDeg(
          Math.sin(this.time.now * 0.005) * 15
        ));
      } else {
        duckling.setAngle(0);
      }
    }
    teacher.y = window.innerHeight - 200 + Math.sin(this.time.now * 0.002) * 10;
    teacherSpeechBubble.y = teacher.y - 100;
    instructionText.y = teacher.y - 100;
  }

  return () => {
    game.destroy(true);
  };
}, []);

const handleBackClick = () => {
  onBack();
};

return (
  <div>
    <div id="game-container" ref={gameRef}></div>
    <button 
      onClick={handleBackClick}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 10
      }}
    >
      Back to Home
    </button>
  </div>
);
};

export default StackQueueGame;