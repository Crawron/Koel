import {
	buttonComponent,
	defineSlashCommand,
	embedComponent,
} from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export const playerCommand = defineSlashCommand({
	name: "player",
	description: "Show a message to control the audio player",

	run(ctx) {
		const player = tryGetPlayer(ctx)
		if (!player) return

		let description = ""

		ctx.reply(() => [
			embedComponent({
				title: "Koel Player",
				description:
					`**Currently Playing**: ${player.currentSong?.title ?? "*Nothing*"}` +
					description,
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
