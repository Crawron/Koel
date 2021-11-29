import { join } from "path"
import { readFile, writeFile } from "jsonfile"
import { Snowflake } from "discord.js"
import FastGlob from "fast-glob"
import { unlink } from "fs/promises"
import { log } from "./logging"
import { debounce } from "./helpers"

export type SongData = {
	title: string
	mediaUrl: string
	pageUrl: string
	source: string
	duration: number
	thumbnailUrl?: string
	uploader?: string
	requester: Snowflake
	chapters: {
		title: string
		start: number
	}[]
}

export type QueueData = {
	id: Snowflake
	list: SongData[]
	queuePosition: number
	paused: boolean
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

async function saveQueueBounced(queue: QueueData) {
	await writeFile(`storage/queues/${queue.id}.json`, queue, {
		spaces: 2,
	})
	log(`Saved queue ${queue.id}`, 0)
}

export const saveQueue = debounce(1000, saveQueueBounced)

export async function deleteQueue(queueId: string) {
	await unlink(`storage/queues/${queueId}.json`)
}
