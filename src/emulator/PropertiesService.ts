import { Properties } from "./Properties.js";


export class PropertiesService {
    private static scriptProperties: Properties | null = null;

    public static getScriptProperties() {
        return PropertiesService.scriptProperties || (PropertiesService.scriptProperties = new Properties())
    }
}