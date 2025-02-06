
### 📜 **Anshul’s Game (DSA Adventure) - Backend**  
_Backend for a 2D Super Mario-style game built with Node.js, Express, and MongoDB._

---

## 🚀 **Project Overview**  
This backend handles:
- **User Management** (Username-based, no authentication)
- **Tracking LeetCode Points**
- **Managing Power-ups & Rewards**
- **Recording Player Achievements**
- **Game Progress & Level Scores**
- **Global Leaderboard (Rankings)**

---

## 🛠️ **Tech Stack**
- **Node.js & Express.js** - API Framework  
- **MongoDB & Mongoose** - Database  
- **dotenv** - Environment variable management  
- **cors** - Enable frontend-backend communication  

---

## ⚙️ **Setup Instructions**
Follow these steps to set up the backend:

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/WE-Arcade/Anshul_Game.git
cd Anshul_Game
git checkout backend  # Switch to backend branch
```

### 2️⃣ **Install Dependencies**
```bash
npm install
```

### 3️⃣ **Set Up Environment Variables**
Create a `.env` file in the root directory and add:

```
MONGO_URI={Your MONGO_URI comes here}
PORT=5000
```

### 4️⃣ **Start MongoDB Locally**
Make sure MongoDB is installed and running:
```bash
mongod
```

### 5️⃣ **Run the Server**
Start the backend server:
```bash
node server.js
```
OR use **nodemon** (auto-restarts on changes):
```bash
nodemon server.js
```

---

## 🔗 **API Endpoints**
### **📌 POST Requests**
| Endpoint             | Description |
|----------------------|-------------|
| `/api/username`      | Create a new user |
| `/api/progress`      | Update game progress (world & level) |
| `/api/points`        | Add LeetCode points |
| `/api/rewards`       | Add rewards (power-ups) |
| `/api/achievements`  | Add achievements |
| `/api/score`         | Update level score |

### **📌 GET Requests**
| Endpoint                 | Description |
|--------------------------|-------------|
| `/api/user-profile/:username` | Get all details of a specific user |
| `/api/leaderboard`       | Fetch global leaderboard |

For detailed API documentation, check **API_docs.md**.

---

## 📂 **Project Structure**
```
will be updated later on
```
---

## 👥 **Contributors**
- **Backend Developer**: Khyati Satija  
- **Team Members**: Maanasa, Akanksha, Zoheen  

---
