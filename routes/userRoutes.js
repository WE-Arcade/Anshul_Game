const express = require("express");
const {
    createUser,
    updateProgress,
    addPoints,
    addReward,
    addAchievement,
    updateScore,
    getUserProfile,
    getLeaderboard
} = require("../controller/userController");

const router = express.Router();

router.post("/username", createUser);
router.post("/progress", updateProgress);
router.post("/points", addPoints);
router.post("/rewards", addReward);
router.post("/achievements", addAchievement);
router.post("/score", updateScore);
router.get("/user-profile/:username", getUserProfile);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
