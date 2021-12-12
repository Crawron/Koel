import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("ping"),
		description: "Ping check",
		run(ctx) {
			ctx.reply(() => "Pong")
		},
	})
}
