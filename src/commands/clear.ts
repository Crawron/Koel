import { Gatekeeper } from "@itsmapleleaf/gatekeeper"
import { tryGetPlayer } from "../playerHandler"

export default function defineCommands(gatekeeper: Gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "clear",
        description: "Clear the queue",
        run(ctx) {
            const player = tryGetPlayer(ctx)
            if (!player) return

            player.clearQueue()

            ctx.reply(() => "_Cleared_ :thumbsup:")
        },
    });
}
