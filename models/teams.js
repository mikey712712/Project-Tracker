const mongoose = require("mongoose")
const teamSchema = new mongoose.Schema({
	name: { type: String, required: true },
	teamProjects: [String],
	memberIds: [String],
	adminIds: [String],
})

const Team = mongoose.model("Team", userSchema)

module.exports = Team
