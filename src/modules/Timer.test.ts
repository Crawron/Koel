import { expect, test } from "vitest"
import { sleep } from "../helpers"
import { Timer } from "./Timer"

test("Counts time", async () => {
	const timer = new Timer()

	timer.run()
	await sleep(1000)
	timer.pause()
	expect(timer.time).toBe(1)
})

test("Pauses and resumes counting", async () => {
	const timer = new Timer()

	timer.run()
	await sleep(1000)
	timer.pause()
	expect(timer.time).toBe(1)
	await sleep(1000)
	timer.run()
	await sleep(1000)
	timer.pause()
	expect(timer.time).toBe(2)
})

test("Timer resets but keeps counting", async () => {
	const timer = new Timer()

	timer.run()
	await sleep(1000)
	timer.reset()
	expect(timer.time).toBe(0)
	await sleep(1000)
	expect(timer.time).toBe(1)
})
