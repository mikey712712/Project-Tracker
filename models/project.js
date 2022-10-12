const mongoose = require("mongoose")
const projectSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },
		files: [
			{
				originalname: String,
				path: String,
				description: String,
			},
		],
		deadline: Date,
		team: String,
		user: String,
		todos: [String],
		notes: [
			{
				title: { type: String, default: "Untitled" },
				content: { type: String, required: true },
				createdAt: Date,
				postedBy: String,
			},
		],
	},
	{
		timestamps: true,
	}
)

const Project = mongoose.model("Project", projectSchema)
module.exports = Project
