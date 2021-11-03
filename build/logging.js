"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.LogLevel = void 0;
const chalk_1 = require("chalk");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warning"] = 2] = "Warning";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
const levelText = {
    0: (0, chalk_1.bgWhite) ` Dbg `,
    1: (0, chalk_1.bgBlueBright) ` Inf `,
    2: (0, chalk_1.bgYellow) ` Wrn `,
    3: (0, chalk_1.bgRedBright) ` Err `,
};
function log(message, level = LogLevel.Info) {
    if (level < (process.env.LOGLEVEL ?? 1))
        return;
    const timestamp = new Date().toLocaleTimeString();
    console.log((0, chalk_1.black)(levelText[level]), (0, chalk_1.gray)(timestamp), message);
    // TODO log to discord channel
}
exports.log = log;
//# sourceMappingURL=logging.js.map