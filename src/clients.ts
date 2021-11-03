import { Client } from "discord.js"

export const djsClient = new Client({
	intents: ["GUILD_VOICE_STATES", "GUILDS"],
})
