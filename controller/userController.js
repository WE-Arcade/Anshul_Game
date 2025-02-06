const User = require("../models/User");

// 📌 Create a new user
exports.createUser = async (req, res) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: "Username already taken" });

        user = new User({ username });
        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Update game progress
exports.updateProgress = async (req, res) => {
    try {
        const { username, world, level } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (world < user.progress.world || (world === user.progress.world && level <= user.progress.level)) {
            return res.status(400).json({ message: "You have already completed this or a higher level." });
        }

        user.progress.world = world;
        user.progress.level = level;
        await user.save();
        res.status(200).json({ message: "Progress updated", progress: user.progress });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Add LeetCode points
exports.addPoints = async (req, res) => {
    try {
        const { username, points } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        user.leetcodePoints += points;
        await user.save();
        res.status(200).json({ message: "Points updated", totalPoints: user.leetcodePoints });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Add rewards
exports.addReward = async (req, res) => {
    try {
        const { username, reward } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        user.rewards.push(reward);
        await user.save();
        res.status(200).json({ message: "Reward added", rewards: user.rewards });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Add achievements
exports.addAchievement = async (req, res) => {
    try {
        const { username, achievement } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        user.achievements.push(achievement);
        await user.save();
        res.status(200).json({ message: "Achievement added", achievements: user.achievements });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Update score per level
exports.updateScore = async (req, res) => {
    try {
        const { username, world, level, score } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        const levelKey = `${world}-${level}`;
        user.scores.set(levelKey, score);
        await user.save();
        res.status(200).json({ message: "Score updated", scores: user.scores });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 Fetch global leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find({})
            .sort({ leetcodePoints: -1 })
            .select("username leetcodePoints");

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
