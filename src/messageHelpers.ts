import {
	buttonComponent,
	ButtonInteractionContext,
	embedComponent,
	ReplyComponent,
} from "@itsmapleleaf/gatekeeper"
import { Song } from "./modules/Song"

export function getQueueAddedMessage(
	songs: Song[],
	addedPosition: number
): ReplyComponent[] {
	const songList = songs
		.slice(0, 5)
		.map((song, i) =>
			song.stringify({ link: true, index: addedPosition + i, requester: false })
		)
		.join("\n")

	const footer =
		songs.length > 5 ? { text: `And ${songs.length - 5} more...` } : undefined

	return [
		embedComponent({
			author: { name: "Added to queue" },
			description: `${songList}`,
			color: 0x0773e6,
			footer: footer,
		}),
	]
}

export function accentButton(
	label: string,
	callback: (ctx: ButtonInteractionContext) => void
) {
	return buttonComponent({ label, style: "PRIMARY", onClick: callback })
}

export function grayButton(
	label: string,
	callback: (ctx: ButtonInteractionContext) => void
) {
	return buttonComponent({ label, style: "SECONDARY", onClick: callback })
}
