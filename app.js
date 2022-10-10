const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const passport = require("passport")
const methodOverride = require("method-override")
const projectsController = require("./controllers/projects.js")
const authController = require("./controllers/auth.js")
const flash = require("express-flash")
const session = require("express-session")
const mongoDBSession = require("connect-mongodb-session")
const User = require("./models/users")
const app = express()
const PORT = 3000

const dbURL = "mongodb://localhost:27017/projectmanager"
const db = mongoose.connection

mongoose.connect(dbURL, async () => {
	console.log("Mongoose Projects DB connection made!")
})

const MongoDBStore = mongoDBSession(session)
const sessionStore = new MongoDBStore({
	uri: dbURL,
	collection: "sessions",
})

app.use(methodOverride("_method"))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(
	session({
		secret: "secretPhrase",
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
	})
)
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", (req, res) => {
	res.render("home.ejs")
})

app.use(authController)
app.use(projectsController)

app.listen(PORT, () => {
	console.log("Listening on PORT", PORT)
})
