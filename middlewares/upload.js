const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

require("dotenv").config()
cloudinary.config()

const upload = multer({
	storage: new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: "projects",
		},
	}),
})

module.exports = upload
