import "dotenv/config"

import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { log, LogLevel } from "./logging"
import { bold } from "chalk"
import path from "path/posix"
import { djsClient } from "./clients"
import { loadQueues } from "./queueHandler"
import { getQueueStorage } from "./storage"
import { configure } from "mobx"

configure({ enforceActions: "never" })

const commandMode = process.env.COMMANDMODE ?? "guild"

;(async () => {
	await Gatekeeper.create({
		name: "Koel",
		client: djsClient,
		commandFolder: path.join(__dirname, "commands"),
		logging: true,
	})

	djsClient.on("ready", async () => {
		log(`Ready. Connected to ${bold(djsClient.user?.username)}`)
		log(`Using ${bold(commandMode)} commands`)

		const storage = await getQueueStorage()
		log(storage.length, 0)
		loadQueues(storage)
		log(`Loaded queues`)
	})

	djsClient
		.login(process.env.KOELTOKEN)
		.catch((e: Error) => log(e, LogLevel.Error))
})()
