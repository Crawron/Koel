import "dotenv/config"

import { Client } from "discord.js"
import {
	createGatekeeper,
	SlashCommandDefinition,
} from "@itsmapleleaf/gatekeeper"
import { log, LogLevel } from "./logging"
import { pingCommand } from "./commands/ping"
import { bold } from "chalk"
import { playCommand } from "./commands/play"
import { queueCommand } from "./commands/queue"
import { searchCommand } from "./search"
import { skipCommand } from "./commands/skip"
import { testCommand } from "./commands/testCommand"
import { nowPlayingCommand } from "./commands/nowPlaying"
import { shuffleCommand } from "./commands/shuffle"
import { clearCommand } from "./commands/clear"

const djsClient = new Client({ intents: ["GUILD_VOICE_STATES", "GUILDS"] })

const commandMode = process.env.COMMANDMODE ?? "guild"

const gatekeeper = createGatekeeper({ name: "Koel" })
gatekeeper.useClient(djsClient, {
	useGuildCommands: commandMode !== "global",
	useGlobalCommands: commandMode === "global",
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const commands: SlashCommandDefinition<any>[] = [
	pingCommand,
	playCommand,
	queueCommand,
	searchCommand,
	skipCommand,
	testCommand,
	nowPlayingCommand,
	shuffleCommand,
	clearCommand,
]
commands.forEach(gatekeeper.addCommand)

djsClient.on("ready", () => {
	log(`Ready`)
	log(`Using ${bold(commandMode)} commands`)
	log(`Loaded Commands: ${commands.map((cmd) => bold(cmd.name)).join(", ")}`)
})

djsClient
	.login(process.env.KOELTOKEN)
	.catch((e: Error) => log(e, LogLevel.Error))
