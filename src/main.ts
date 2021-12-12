import "dotenv/config"

import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { log, LogLevel } from "./logging"
import path from "path"
import { djsClient } from "./clients"
import { configure } from "mobx"
import { filePath } from "./helpers"

configure({ enforceActions: "never" })
;(async () => {
	await Gatekeeper.create({
		name: "Koel",
		client: djsClient,
		commandFolder: path.join(
			filePath(import.meta.url).dirname,
			"commands/definitions"
		),
		logging: true,
	})

	djsClient
		.login(process.env.KOELTOKEN)
		.catch((e: Error) => log(e, LogLevel.Error))
})()
