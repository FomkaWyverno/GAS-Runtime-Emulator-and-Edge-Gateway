import { ButtonSet } from "./ButtonSet.js";


export class Browser {
    public static readonly Buttons = new ButtonSet();

    public static msgBox(): void {
        throw new Error("GAS Emulator not support msgBox");
    }
}