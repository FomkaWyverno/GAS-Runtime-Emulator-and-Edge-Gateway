export class CacheService {
    private scriptCache: Cache | null = null;

    public getScriptCache(): Cache {
        return this.scriptCache || (this.scriptCache = new Cache());
    }
}