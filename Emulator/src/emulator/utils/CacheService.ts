import { Cache } from "./Cache.js";

export class CacheService {
    private static scriptCache: Cache | null = null;

    public static getScriptCache(): Cache {
        return CacheService.scriptCache || (CacheService.scriptCache = new Cache());
    }
}