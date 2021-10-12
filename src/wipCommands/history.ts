import { Gatekeeper } from "@itsmapleleaf/gatekeeper"

export default function defineCommands(gatekeeper: Gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "history",
        description: "Show a history of previously played songs",
        run() {},
    });
}
