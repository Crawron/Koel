import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, distribute, shuffle } from "../../helpers"
import { Song } from "../../modules/Song"
import { controllerStore } from "../../stores/controllerStore"
import { guildCheck } from "../common"

export default function defineCommands(gatekeeper: Gatekeeper) {
	gatekeeper.addSlashCommand({
		name: cmdName("autosort"),
		description: "Automatically sort upcoming queue *every time it changes*",

		options: {
			mode: {
				type: "STRING",
				description:
					"The mode to use for sorting. Can be `Disabled`, `Distribute`, or `Shuffle`",
				choices: [
					{ name: "Disabled", value: "disabled" },
					{ name: "Distribute", value: "distribute" },
					{ name: "Shuffle", value: "shuffle" },
				],
				required: true,
			},
		},

		run: async (ctx) => {
			if (!guildCheck(ctx, ctx.guild)) return
			const controller = controllerStore.getOrCreate(ctx.guild.id)

			const autoSorters: Record<string, (songs: Song[]) => Song[]> = {
				disabled: (songs) => songs,
				shuffle,
				distribute: (songs) => distribute(songs, (song) => song.requester),
			} as const

			controller.queue.autoSorter =
				autoSorters[ctx.options.mode] ?? ((songs: Song[]) => songs)

			ctx.reply(() => `Auto-sort mode set to **${ctx.options.mode}**`)
		},
	})
}
