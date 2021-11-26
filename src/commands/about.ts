import { get } from "https"
import { embedComponent, Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { cmdName, isTruthy, randomItem } from "../helpers"

export default async function defineCommands(gatekeeper: Gatekeeper) {
	const lyrics = (await getBody(process.env.LYRICS_URL ?? ""))
		.split("\n")
		.map((x) => x.trim())
		.filter(isTruthy)
		.filter((x) => !x.startsWith("//"))

	gatekeeper.addSlashCommand({
		name: cmdName("about"),
		description: "About me",
		run(ctx) {
			ctx.reply(() => [
				embedComponent({
					description: `
:feather: _**Koel** ~ <@109677308410875904>'s personal music bot_
_\`Our big music bots died so I made my own\`_

Give me YouTube, Soundcloud, Bandcamp, Twitter Videos, File URLs, F'in PNGs [idc](http://ytdl-org.github.io/youtube-dl/supportedsites.html "*too* complete list of supported sites")... (not spotify tho, [bearger](https://bearger.app/) does tho)

**Koel's a private bot, so invitiation requires <@109677308410875904> to also be invited**

[Source on GitHub](https://github.com/Crawron/Koel "♥"), including a list of planned features and known bugs. Also give me a star, I dare you :star:
`,
					color: 0x0773e6,
					image: { url: "https://elixi.re/i/8v7zt.png" },
					footer: { text: randomItem(lyrics) },
				}),
			])
		},
	})
}

function getBody(url: string) {
	return new Promise<string>((resolve) => {
		get(url, (res) => {
			let body = ""
			res.on("data", (chunk) => (body += chunk))
			res.on("end", () => resolve(body))
			res.on("error", () => resolve(""))
		})
	})
}
