import React, { useEffect } from 'react';
import Phaser from 'phaser';

const LandingPage = ({ onProceed }) => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'landing-canvas',
      scene: {
        preload: preload,
        create: create,
      },
    };

    const game = new Phaser.Game(config);

    function preload() {
      this.load.image('sage', 'assets/sage.png');
      this.load.image('asokan', 'assets/asokan_sage.png');
      this.load.image('anasuya', 'assets/anasuya_sage.png');
      this.load.image('background', 'assets/sky_background.png');
      this.load.audio('backgroundMusic', 'assets/background_music.mp3');
    }

    function create() {
      // Background
      this.add.image(400, 300, 'background').setScale(2);

      // Sage (Anshul) sprite with animation
      const sage = this.add.sprite(200, 400, 'sage').setScale(0.5);
      this.tweens.add({
        targets: sage,
        y: sage.y - 20,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      // Anasuya sprite with animation (adjusted to be smaller)
      const anasuya = this.add.sprite(400, 400, 'anasuya').setScale(0.15); // Reduced from 0.45 to 0.3
      this.tweens.add({
        targets: anasuya,
        y: anasuya.y - 20,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      // Asokan sprite with animation
      const asokan = this.add.sprite(600, 400, 'asokan').setScale(0.4);
      this.tweens.add({
        targets: asokan,
        y: asokan.y - 20,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      // Title and subtitle
      this.add.text(400, 100, 'Welcome to CodeRunner - DSA Game', {
        fontSize: '32px',
        color: '#FFD700',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);
      this.add.text(400, 150, 'by Anshul (Sage), Anasuya (Sage), Asokan (Wizard)', {
        fontSize: '24px',
        color: 'black',
        align: 'center',
      }).setOrigin(0.5);

      // Play background music
      const music = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
      music.play();
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="landing-page">
      <div id="landing-canvas" style={{ width: '800px', height: '600px', margin: '0 auto' }}></div>
      <div className="dsa-info">
        <h2>Welcome to the World of DSA!</h2>
        <p>
          Embark on an epic journey through the realm of Data Structures and Algorithms, where coding meets adventure! 
          Guided by the wise sages <strong>Anshul</strong> and <strong>Anasuya</strong>, you will navigate a world 
          filled with challenges, puzzles, and battles against the dreaded <strong>Code Smells</strong>.
        </p>
        <p>
          Your quest? Master the art of clean and efficient code! Earn <strong>LeetCode Coins</strong> by solving tricky 
          programming puzzles, strengthen your problem-solving skills, and collect powerful rewards to aid you on your path. 
          But beware—only the most skilled coders will make it to the final challenge: facing the legendary <strong>Wizard Asokan</strong>. 
          Prove your mastery, unlock the secrets of clean code, and claim the ultimate wisdom!
        </p>
        <h2>Why Learn DSA Through This Quest?</h2>
        <ul>
          <li>
            <strong>Sharpen Your Skills:</strong> Master key concepts like arrays, trees, and graphs while having fun!
          </li>
          <li>
            <strong>Battle Code Smells:</strong> Solve problems, refactor messy code, and become a clean code warrior.
          </li>
          <li>
            <strong>Level Up:</strong> Progress through increasingly challenging levels and earn rewards for your knowledge.
          </li>
          <li>
            <strong>Become a Legend:</strong> Only those who reach the Wizard Asokan will attain the wisdom of clean code mastery.
          </li>
        </ul>
        <p>
          Are you ready to begin your journey? The world of DSA awaits! 
        </p>
      </div>
      <button className="proceed-button" onClick={onProceed}>
        Begin Your Quest
      </button>
    </div>
  );
}  
export default LandingPage;