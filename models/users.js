const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const userSchema = new mongoose.Schema({
	userProjects: [String],
	team: { type: String, default: "noteam" },
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

module.exports = User
