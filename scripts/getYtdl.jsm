const simpleGit = require("simple-git")
const execa = require("execa")
const cpy = require("cpy")
const rimraf = require("rimraf")

require("dotenv/config")

async function getYtdl() {
	const git = simpleGit()

	console.log("Cloning youtube-dl repo")
	await git.clone(
		process.env.YTDLGITREPO ?? "https://github.com/ytdl-org/youtube-dl.git"
	)

	console.log("Running `make lazy-extractors`")
	execa.sync("make", ["lazy-extractors"], { cwd: "./youtube-dl" })

	console.log("Running `make youtube-dl`")
	execa.sync("make", ["youtube-dl"], { cwd: "./youtube-dl" })

	console.log("Copying to youtube-dl/bin")
	await cpy(
		"./youtube-dl/bin/youtube-dl",
		"./node_modules/youtube-dl-exec/bin/"
	)

	rimraf("./youtube-dl", (e) => {
		throw e
	})
}

getYtdl()
