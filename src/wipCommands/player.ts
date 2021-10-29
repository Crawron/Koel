import {
	buttonComponent,
	embedComponent,
	Gatekeeper,
} from "@itsmapleleaf/gatekeeper"
import { tryGetQueue } from "../queueHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: "player",
		description: "Show a message to control the audio player",

		run(ctx) {
			const player = tryGetQueue(ctx)
			if (!player) return

			let description = ""

			ctx.reply(() => [
				embedComponent({
					title: "Koel Player",
					description:
						`**Currently Playing**: ${
							player.currentSong?.title ?? "*Nothing*"
						}` + description,
				}),
				buttonComponent({
					emoji: "▶️",
					style: "PRIMARY",
					label: "",
					onClick: () => {
						description = "You clicked Play"
					},
				}),
				buttonComponent({
					emoji: "⏭️",
					style: "PRIMARY",
					label: "",
					onClick: () => {
						description = "You clicked Skip"
					},
				}),
				buttonComponent({
					emoji: "⏹️",
					style: "PRIMARY",
					label: "",
					onClick: () => {
						/**/ description = "You clicked Stop"
					},
				}),
			])
		},
	})
}
