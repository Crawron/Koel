"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function defineCommands(gatekeeper) {
    gatekeeper.addSlashCommand({
        name: "test",
        description: "Test command",
        options: {
            test: { description: "Test option", required: true, type: "STRING" },
        },
        run({ reply, options }) {
            const { test } = options;
            reply(() => test);
        },
    });
}
exports.default = defineCommands;
//# sourceMappingURL=testCommand.js.map