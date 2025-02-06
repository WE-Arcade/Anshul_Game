const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },  // Unique username
  leetcodePoints: { type: Number, default: 0 },             // Total LeetCode points
  rewards: { type: [String], default: [] },                 // List of rewards (power-ups, etc.)
  achievements: { type: [String], default: [] },            // List of achievements unlocked
  progress: { 
    world: { type: Number, default: 1 },                    // Current world (1 to 5)
    level: { type: Number, default: 1 }                     // Current level (1 to 2)
  },
  scores: {                                                 // Score tracking per level
    type: Map, 
    of: Number,                                             // Example: { "1-1": 50, "1-2": 100, ... }
    default: {} 
    //key is "worldNumber-levelNumber" , value is Number that is the score obtained in that level.
  }
});

// Export Model
module.exports = mongoose.model("User", UserSchema);
