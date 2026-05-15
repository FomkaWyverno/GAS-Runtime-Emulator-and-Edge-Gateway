import { Console } from "../emulator/Console.js";

export function initGasEmulator() {
    const global = globalThis as any;

    const consoleInstance = new Console();
    global.Console = consoleInstance;
    global.Logger = consoleInstance;
}