const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const upload = require("../middlewares/upload")
const Projects = require("../models/project")
const Users = require("../models/users")
const ensureLogin = require("connect-ensure-login")
const passport = require("passport")

router.use(ensureLogin.ensureLoggedIn())

// INDEX
router.get("/projects", async (req, res) => {
	try {
		const teamProjects = await Projects.find({ team: req.user.team })
		const userProjects = await Projects.find({ user: req.user._id })
		console.log(userProjects)
		res.render("index.ejs", {
			userProjects: userProjects,
			teamProjects: teamProjects,
		})
	} catch (err) {
		err.message
	}
})

// CREATE
router.get("/projects/new", (req, res) => {
	console.log(req.user.team)
	console.log(req.user)
	res.render("new.ejs", {
		user: req.user,
	})
})

// POST
router.post("/projects", upload.any("projectFile"), async (req, res) => {
	try {
		console.log(req.body.title)
		console.log(req.files)
		console.log("w")
		const proj = await Projects.create({
			title: req.body.title,
			description: req.body.description,
			deadline: req.body.deadline,
			files: req.files,
		})
		if (req.body.team) {
			await Projects.findByIdAndUpdate(proj._id, {
				team: req.user.team,
			})
		} else {
			await Projects.findByIdAndUpdate(proj._id, {
				user: req.user._id,
			})
		}
		console.log(proj)
		req.flash("success", "New project created")
		res.redirect("/projects")
	} catch (err) {
		console.log(err.message)
	}
})

// SHOW
router.get("/projects/:projectId", async (req, res) => {
	try {
		const project = await Projects.findById(req.params.projectId)
		console.log(project)
		res.render("show.ejs", {
			project: project,
		})
	} catch (err) {
		console.log(err.message)
	}
})

module.exports = router
