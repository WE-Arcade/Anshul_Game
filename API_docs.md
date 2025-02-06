# **📜 API Documentation for Anshul’s Game (DSA Adventure) - User APIs**  
📌 **Base URL:** `http://localhost:5000/api/users`  

This document provides details about all available API endpoints in the backend, including **HTTP methods, URLs, descriptions, request body, and response examples**.

---

## **📌 POST Requests**

### **1️⃣ Create a New User**  
- **Endpoint:** `/username`  
- **Description:** Creates a new user with a unique username.  
- **Request Body:**  
    ```json
    {
      "username": "mario_player"
    }
    ```
- **Response (Success):**  
    ```json
    {
      "message": "User created successfully",
      "user": {
        "username": "mario_player",
        "leetcodePoints": 0,
        "rewards": [],
        "achievements": [],
        "progress": { "world": 1, "level": 1 },
        "scores": {}
      }
    }
    ```
- **Response (Failure - Username Already Taken):**  
    ```json
    {
      "message": "Username already taken"
    }
    ```

---

### **2️⃣ Update User Progress**  
- **Endpoint:** `/progress`  
- **Description:** Updates the latest progress (only sequential unlocking allowed).  
- **Request Body:**  
    ```json
    {
      "username": "mario_player",
      "world": 1,
      "level": 2
    }
    ```
- **Response (Success):**  
    ```json
    {
      "message": "Progress updated",
      "progress": { "world": 1, "level": 2 }
    }
    ```
- **Response (Failure - Skipping Levels):**  
    ```json
    {
      "message": "You have already completed this or a higher level."
    }
    ```

---

### **3️⃣ Update LeetCode Points**  
- **Endpoint:** `/points`  
- **Description:** Adds points to a user’s total.  
- **Request Body:**  
    ```json
    {
      "username": "mario_player",
      "points": 50
    }
    ```
- **Response:**  
    ```json
    {
      "message": "Points updated",
      "totalPoints": 50
    }
    ```

---

### **4️⃣ Add Rewards (Power-ups)**  
- **Endpoint:** `/rewards`  
- **Description:** Adds a reward (power-up) to the user’s inventory.  
- **Request Body:**  
    ```json
    {
      "username": "mario_player",
      "reward": "Super Jump"
    }
    ```
- **Response:**  
    ```json
    {
      "message": "Reward added",
      "rewards": ["Super Jump"]
    }
    ```

---

### **5️⃣ Add Achievements**  
- **Endpoint:** `/achievements`  
- **Description:** Adds an achievement for the user.  
- **Request Body:**  
    ```json
    {
      "username": "mario_player",
      "achievement": "First Obstacle Smashed!"
    }
    ```
- **Response:**  
    ```json
    {
      "message": "Achievement added",
      "achievements": ["First Obstacle Smashed!"]
    }
    ```

---

### **6️⃣ Update Score Per Level**  
- **Endpoint:** `/score`  
- **Description:** Updates the score for a specific level.  
- **Request Body:**  
    ```json
    {
      "username": "mario_player",
      "world": 1,
      "level": 2,
      "score": 120
    }
    ```
- **Response:**  
    ```json
    {
      "message": "Score updated",
      "scores": { "1-2": 120 }
    }
    ```

---

## **📌 GET Requests**

### **7️⃣ Get User Profile**  
- **Endpoint:** `/user-profile/:username`  
- **Description:** Fetches all details of a specific user.  
- **Example Request:**  
    ```
    GET /api/users/user-profile/mario_player
    ```
- **Response:**  
    ```json
    {
      "username": "mario_player",
      "leetcodePoints": 50,
      "rewards": ["Super Jump"],
      "achievements": ["First Obstacle Smashed!"],
      "progress": { "world": 1, "level": 2 },
      "scores": { "1-2": 120 }
    }
    ```

---

### **8️⃣ Get Global Leaderboard**  
- **Endpoint:** `/leaderboard`  
- **Description:** Fetches the global leaderboard sorted in descending order of LeetCode points.  
- **Example Request:**  
    ```
    GET /api/users/leaderboard
    ```
- **Response:**  
    ```json
    [
      { "username": "player1", "leetcodePoints": 200 },
      { "username": "mario_player", "leetcodePoints": 50 }
    ]
    ```

---

## **📌 Notes**
- All `POST` requests require a **valid username** in the request body.
- User progress **cannot skip levels** (must unlock sequentially).
- Leaderboard only displays **username** and **LeetCode points**.
- Scores are stored in a **"World-Level" format** (e.g., `"1-2": 120`).

---

## **📜 How to Use This API**
### **1️⃣ Start Backend**
```bash
nodemon server.js
```


