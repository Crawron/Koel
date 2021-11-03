import { join } from "path"
import { readFile, writeFile } from "jsonfile"
import { Snowflake } from "discord.js"
import FastGlob from "fast-glob"
import { unlink } from "fs/promises"
import { log } from "./logging"

export type SongData = {
	title: string
	mediaUrl: string
	url: string
	source: string
	duration: number
	thumbnail?: string
	uploader?: string
	requester: Snowflake
	chapters: {
		title: string
		startTime: number
	}[]
}

export type QueueData = {
	id: Snowflake
	list: SongData[]
	queuePosition: number
	playerStatus: "Playing" | "Paused" | "StandBy"
	voiceChannel?: Snowflake
	playedTime: number
}

export async function getQueueStorage() {
	const queueFilePaths = await FastGlob("storage/queues/*.json")
	log(join("storage", "queues", "*.json"), 0)
	log(`Found ${queueFilePaths.length} queue files.`, 0)
	const queueDataStorage: QueueData[] = []

	for (const path of queueFilePaths) {
		const queueData = (await readFile(path)) as QueueData
		queueDataStorage.push(queueData)
	}

	return queueDataStorage
}

export async function saveQueue(queue: QueueData) {
	await writeFile(`storage/queues/${queue.id}.json`, queue, {
		spaces: 2,
	})
}

export async function deleteQueue(queue: QueueData) {
	await unlink(`storage/queues/${queue.id}.json`)
}
