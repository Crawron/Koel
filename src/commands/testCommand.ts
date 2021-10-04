import { defineSlashCommand } from "@itsmapleleaf/gatekeeper"
export const testCommand = defineSlashCommand({
	name: "test",
	description: "Test command",
	options: {
		test: { description: "Test option", required: true, type: "STRING" },
	},
	run({ reply, options }) {
		const { test } = options

		reply(() => test)
	},
})
