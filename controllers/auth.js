const express = require("express")
const passport = require("passport")

const User = require("../models/users")

const router = express.Router()

router.get("/register", (req, res) => {
	res.render("register.ejs")
})

router.post("/register", async (req, res) => {
	try {
		const { username, password, team } = req.body
		console.log(team)
		let user
		if (team !== "") {
			user = await User.register(new User({ username: username, team: team }), password)
		} else {
			user = await User.register(new User({ username: username }), password)
		}
		console.log(user)
		req.login(user, () => {
			res.redirect("/projects")
		})
	} catch (err) {
		req.flash("error", err.message)
		res.redirect("/register")
	}
})
router.get("/login", (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect("back")
	} else {
		res.render("login.ejs")
	}
})

router.post(
	"/login",
	passport.authenticate("local", {
		failureRedirect: "/login",
		successRedirect: "/projects",
		failureFlash: true,
	})
)

router.post("/logout", (req, res) => {
	req.logout(() => {
		res.redirect("/")
	})
})

module.exports = router
