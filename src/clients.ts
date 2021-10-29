import { PrismaClient } from "@prisma/client"
import { Client } from "discord.js"

export const prismaDb = new PrismaClient()
export const djsClient = new Client({
	intents: ["GUILD_VOICE_STATES", "GUILDS"],
})
