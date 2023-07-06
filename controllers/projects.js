const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const upload = require("../middlewares/upload")
const Projects = require("../models/project")
const Users = require("../models/users")
const ensureLogin = require("connect-ensure-login")
const passport = require("passport")
const { findOneAndUpdate } = require("../models/users")

router.use(ensureLogin.ensureLoggedIn())

// INDEX
router.get("/projects", async (req, res) => {
	try {
		const teamProjects = await Projects.find({ team: req.user.team })
		const userProjects = await Projects.find({ user: req.user._id })
		const deadlines = await Projects.find({
			deadline: {
				$ne: null,
			},
			$or: [
				{
					user: req.user._id,
				},
				{
					team: req.user.team,
				},
			],
		})
		deadlines.sort((a, b) => {
			return a.deadline - b.deadline
		})
		console.log(deadlines)
		res.render("index.ejs", {
			userProjects: userProjects,
			teamProjects: teamProjects,
			deadlines: deadlines,
		})
	} catch (err) {
		err.message
	}
})

// EDIT
router.get("/projects/:projectId/edit", async (req, res) => {
	try {
		const targetProject = await Projects.find({
			$or: [
				{
					_id: req.params.projectId,
					user: req.user._id,
				},
				{
					_id: req.params.projectId,
					team: req.user.team,
				},
			],
		})
		if (!targetProject) {
			throw new Error("boom")
		} else {
			res.render("edit.ejs", {
				project: targetProject[0],
				user: req.user,
			})
		}
	} catch (err) {
		err.message
	}
})

router.put("/projects/:projectId/edit", upload.any("projectFile"), async (req, res) => {
	try {
		const targetProject = await Projects.find({
			$or: [
				{
					_id: req.params.projectId,
					user: req.user._id,
				},
				{
					_id: req.params.projectId,
					team: req.user.team,
				},
			],
		})
		if (!targetProject) {
			throw new Error("boom")
		} else {
			// console.log(req.body)
			const updated = await Projects.findByIdAndUpdate(
				req.params.projectId,
				{
					title: req.body.title,
					deadline: req.body.deadline,
					description: req.body.description,
					$push: {
						files: req.files,
					},
				},
				{ new: true }
			)
			// console.log(updated)
			if (req.body.team) {
				await Projects.findByIdAndUpdate(req.params.projectId, {
					team: req.user.team,
					$unset: {
						user: "",
					},
				})
			} else {
				await Projects.findByIdAndUpdate(req.params.projectId, {
					user: req.user._id,
					$unset: {
						team: "",
					},
				})
			}
			res.redirect(`/projects/${req.params.projectId}`)
		}
	} catch (err) {
		next(err)
	}
})

// EDIT FILE
router.put("/projects/:projectId/editfile", async (req, res) => {
	try {
		await Projects.findOneAndUpdate(
			{
				_id: req.params.projectId,
				"files._id": req.body.fileId,
			},
			{
				$set: {
					"files.$.originalname": `${req.body.originalname}${req.body.extension}`,
					"files.$.description": req.body.description,
				},
			}
		)
		res.redirect(`/projects/${req.params.projectId}`)
	} catch (err) {
		console.log(err.message)
	}
})

// DELETE FILE
router.get("/projects/:projectId/deletefile/:fileId", async (req, res) => {
	try {
		await Projects.findByIdAndUpdate(req.params.projectId, {
			$pull: {
				files: {
					_id: req.params.fileId,
				},
			},
		})
		res.redirect(`/projects/${req.params.projectId}`)
	} catch (err) {
		console.log(err.message)
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
			user: req.user.username,
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
						postedBy: req.body.postedBy,
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
				createdAt: req.body.createdAt,
			},
		},
	})
	res.redirect(`/projects/${req.params.projectId}`)
})

// DELETE PROJECT
router.delete("/projects/:projectId", async (req, res) => {
	try {
		const targetProject = await Projects.find({
			$or: [
				{
					_id: req.params.projectId,
					user: req.user._id,
				},
				{
					_id: req.params.projectId,
					team: req.user.team,
				},
			],
		})
		if (!targetProject) {
			throw new Error("boom")
		} else {
			await Projects.findByIdAndDelete(req.params.projectId)
			res.redirect(`/projects`)
		}
	} catch (err) {
		next(err)
	}
})

module.exports = router
