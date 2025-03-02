# Anshul Game World 3 - Setup and Rules

Welcome to **Anshul Game - World 3** ! This document provides detailed instructions on how to set up the game on your local machine and the rules for playing.

---

## **Game Setup Instructions**

### **Prerequisites**

Before running the game, ensure you have the following installed:

1. **Node.js** (Download from [nodejs.org](https://nodejs.org/))
2. **npm** (Comes with Node.js installation)

### **Cloning the Repository**

1. Open a terminal and navigate to the directory where you want to store the project.
2. Clone the repository using:
   ```sh
   git clone [https://github.com/WE-Arcade/Anshul_Game.git](https://github.com/WE-Arcade/Anshul_Game.git)
   cd Anshul_Game/world3_trees
   ```

### **Installing Dependencies**

Run the following command to install the required dependencies:

```sh
npm install
```

### **Starting the Game**

1. **Using Live Server :**
   ```sh
   npm start
   ```
   This will launch the game in your default web browser at [http://127.0.0.1:8080/](http://127.0.0.1:8080/)

### **Folder Structure**

```
Anshul_Game/
│-- assets/         # Game assets like images and sounds
│-- .gitignore      # Git ignore file
│-- GAME_SETUP_AND_RULES.md  # This file
│-- index.html      # Main HTML file
│-- index.js        # Main JavaScript file
│-- package.json    # Project metadata and scripts
│-- package-lock.json # Dependency lock file
```

---

## **How to Play**

### **Basic Controls**

- **Arrow Keys**: Move the duck.
  - `Left Arrow` → Move left
  - `Right Arrow` → Move right
  - `Up Arrow` → Jump
- **Interacting with Questions**:
  - Move between options using the `Arrow Keys`.
  - Press `Enter` to select the correct answer.

### **Gameplay Mechanics**

- **Climbing Platforms**: Jump onto platforms to navigate through the game.
- **Triggering Coding Questions**:
  - Platforms with a **question mark (?)** will summon  Sage **Anshul**.
  - You must answer the coding question to proceed.
  - If answered correctly, you earn **+50 coins**.
  - If answered incorrectly, you **lose 1 heart**.
- **Avoiding Code Bugs**:
  - **Touching a code bug kills the duck**.
  - **Smash bugs by jumping on their head** to eliminate them (+10 coins).
  - Any other contact with a bug results in death.
- **Winning the Game**:
  - You must **climb all the nodes of the tree** and reach the **Coding Guru Asokan**.
  - **Do this before the timer runs out to win**.
- **Losing the Game**:
  - If the timer reaches **zero** before reaching **Asokan**, you lose.
  - If you lose **all three hearts**, you lose.
- **Collectibles**:
  - **Books and Stars** grant **+20 coins each**.
  - **Smashing bugs** grants **+10 coins**.
  - **Answering coding questions correctly** grants **+50 coins**.

### **Health System**

- You **start with 3 hearts**.
- **Losing Hearts**:
  - Answering a question incorrectly.
  - Touching a code bug.
- If you **lose all hearts**, you lose the game.

---

## **Additional Notes**

- Made with lots of love in phaser.js
- Enjoy and have fun climbing your way to victory!

---
