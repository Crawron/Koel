import { Gatekeeper } from "@itsmapleleaf/gatekeeper"

export default function defineCommands(gatekeeper: Gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "test",
        description: "Test command",
        options: {
            test: { description: "Test option", required: true, type: "STRING" },
        },
        run({ reply, options }) {
            const { test } = options

            reply(() => test)
        },
    });
}
