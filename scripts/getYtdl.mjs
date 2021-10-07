import simpleGit from "simple-git"
import execa from "execa"
import cpy from "cpy"
import rimraf from "rimraf"

import "dotenv/config"

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

	console.log("Deleting cloned repo")
	rimraf("./youtube-dl", (e) => {
		if (e) throw e
	})

	console.log("Done :)")
}

getYtdl()
