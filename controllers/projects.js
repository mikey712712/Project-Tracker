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

// USER PROJECTS
router.get("/projects/my", async (req, res) => {
	try {
		const userProjects = await Projects.find({ user: req.user._id })
		res.render("userprojects.ejs", {
			projects: userProjects,
		})
	} catch (err) {
		console.log(err.message)
	}
})

// TEAM PROJECTS
router.get("/projects/team", async (req, res) => {
	try {
		const teamProjects = await Projects.find({ team: req.user.team })
		res.render("teamprojects.ejs", {
			projects: teamProjects,
			team: req.user.team,
		})
	} catch (err) {
		console.log(err.message)
	}
})

// SHOW
router.get("/projects/:projectId", async (req, res) => {
	try {
		const project = await Projects.findById(req.params.projectId)
		let team = false
		let teamUsers = []
		if (project.team !== undefined) {
			team = true
			teamUsers = await Users.find({ team: project.team })
		}
		res.render("show.ejs", {
			project: project,
			teamProject: team,
			teamUsers: teamUsers,
		})
	} catch (err) {
		console.log(err.message)
	}
})

// POST NOTE
router.post("/projects/:projectId/postnote", async (req, res) => {
	try {
		const project = await Projects.findByIdAndUpdate(req.params.projectId, {
			$push: {
				notes: [
					{
						title: req.body.title,
						content: req.body.content,
						createdAt: new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }),
					},
				],
			},
		})
		console.log(project)
		res.redirect(`/projects/${req.params.projectId}`)
	} catch (err) {
		console.log(err.message)
	}
})

// DELETE NOTE
router.put("/projects/:projectId/deletenote", async (req, res) => {
	const project = await Projects.findByIdAndUpdate(req.params.projectId, {
		$pull: {
			notes: {
				title: req.body.title,
				content: req.body.content,
				createdAt: req.body.createdAt,
			},
		},
	})
	res.redirect(`/projects/${req.params.projectId}`)
})

module.exports = router
