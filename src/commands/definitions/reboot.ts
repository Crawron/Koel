import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName } from "../../helpers"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("reboot"),
		description: "Full reboot",
		run: async (ctx) => {
			if (ctx.user.id !== "109677308410875904") {
				ctx.reply(() => "Craw only, nice try")
				return
			}

			ctx.ephemeralReply(() => "**Rebooting...**")
			process.exit()
		},
	})
}
