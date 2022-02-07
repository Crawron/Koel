import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { Client } from "discord.js"
import "dotenv/config"
import { configure as mobxConfigure } from "mobx"
import path from "path"
import { filePath } from "./helpers"
import { log, LogLevel } from "./logging"

export const djsClient = new Client({
	intents: ["GUILD_VOICE_STATES", "GUILDS"],
})

mobxConfigure({ enforceActions: "never" })

await Gatekeeper.create({
	name: "Koel",
	client: djsClient,
	scope: process.env.NODE_ENV === "production" ? "global" : "guild",
	commandFolder: path.join(
		filePath(import.meta.url).dirname,
		"commands/definitions"
	),
	logging: true,
})

djsClient
	.login(process.env.KOELTOKEN)
	.catch((e: Error) => log(e, LogLevel.Error))
