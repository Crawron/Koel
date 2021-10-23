import "dotenv/config"

import { Client } from "discord.js"
import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { log, LogLevel } from "./logging"
import { bold } from "chalk"
import path from "path/posix"

const djsClient = new Client({ intents: ["GUILD_VOICE_STATES", "GUILDS"] })

const commandMode = process.env.COMMANDMODE ?? "guild"

;(async () => {
	await Gatekeeper.create({
		name: "Koel",
		client: djsClient,
		commandFolder: path.join(__dirname, "commands"),
		logging: true,
	})

	djsClient.on("ready", () => {
		log(`Ready. Connected to ${bold(djsClient.user?.username)}`)
		log(`Using ${bold(commandMode)} commands`)
	})

	djsClient
		.login(process.env.KOELTOKEN)
		.catch((e: Error) => log(e, LogLevel.Error))
})()
