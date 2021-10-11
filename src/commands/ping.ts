import { Gatekeeper } from "@itsmapleleaf/gatekeeper"

export default function defineCommands(gatekeeper: Gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "ping",
        description: "Ping check",
        run(ctx) {
            ctx.reply(() => "Pong")
        },
    });
}
