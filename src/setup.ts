import { Charset } from "./emulator/Charset.js";
import { Console } from "./emulator/Console.js";
import { DigestAlgorithm } from "./emulator/DigestAlgorithm.js";

export function initGasEmulator() {
    const global = globalThis as any;

    const consoleInstance = new Console();
    global.Console = consoleInstance;
    global.Logger = consoleInstance;
    global.DigestAlgorithm = DigestAlgorithm;
    global.Charset = Charset;
}