interface CacheItem {
    value: string;
    expiration: number;
}

export class Cache {
    private readonly MAX_VALUE_SIZE_BYTES = 100*1024;
    private readonly MAX_KEY_SIZE_CHARS = 250;
    private encoder = new TextEncoder();

    constructor(
        private store: Map<string, CacheItem>
    ) { }

    /**
     * Gets the cached value for the given key, or null if none is found.
     * @param key The key to look up in the cache.
     * @returns The cached value, or null if none was found.
     */
    public get(key: string): string | null {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.expiration) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Returns a JavaScript Object containing all key/value pairs found in the cache for an array of keys.
     * @param keys 	The keys to lookup.
     * @returns A JavaScript Object containing the key/value pairs for all keys found in the cache.
     */
    public getAll(keys: string[]): { [keys: string]: string | null } {
        const result: { [keys: string]: string | null } = {};
        for (const key of keys) {
            result[key] = this.get(key);
        }
        return result;
    }

    /**
     * Adds a key/value pair to the cache.
     * The maximum length of a key is 250 characters.
     * The maximum amount of data that can be stored per key is 100KB.
     * The value expires from the cache after 600 seconds (10 minutes).
     * The cap for cached items is 1,000. If more than 1,000 items are written, the cache stores the 900 items farthest from expiration. This limit might change.
     * @param key 
     * @param value 
     * @param expirationInSeconds 
     */
    public put(key: string, value: string, expirationInSeconds: number = 600): void {
        if (key.length > this.MAX_KEY_SIZE_CHARS) throw new Error(`Key too long. Length: ${key.length}. The maximum length of a key is ${this.MAX_KEY_SIZE_CHARS} characters.`);

        const encodedValue = this.encoder.encode(value);
        if (encodedValue.length > this.MAX_VALUE_SIZE_BYTES) throw new Error(`Value too long: ${encodedValue.length} bytes. The maximum size of a value is ${this.MAX_VALUE_SIZE_BYTES} bytes.`);

        if (this.store.size >= 1000) {
            const sortedKeys = Array.from(this.store.entries())
                .sort((a, b) => a[1].expiration - b[1].expiration)
                .slice(0, 100)
                .map(entry => entry[0]);

            sortedKeys.forEach(k => this.store.delete(k));
        }

        const limit = Math.min(expirationInSeconds, 21600);
        const expiration = Date.now() + (limit * 1000);

        this.store.set(key, {
            value: String(value),
            expiration
        });
    }

    /**
     * Adds a set of key/value pairs to the cache, with an expiration time (in seconds).
     * Similar to repeated calls to "put", but more efficient as it only makes one call to the memcache server to set all values.
     * The maximum length of a key is 250 characters. The maximum amount of data that can be stored per key is 100KB.
     * The specified expiration time is only a suggestion; cached data may be removed before this time if a lot of data is cached.
     * The cap for cached items is 1,000. If more than 1,000 items are written, the cache stores the 900 items farthest from expiration.
     * This limit might change.
     * @param values A JavaScript Object containing string keys and values.
     * @param expirationInSeconds The maximum time the value remains in the cache, in seconds The minimum allowed expiration is 1 second, and the maximum allowed expiration is 21600 seconds (6 hours). The default expiration is 600 seconds (10 minutes).
     */
    public putAll(values: { [keys: string]: string }, expirationInSeconds: number = 600): void {
        for (const [key, value] of Object.entries(values)) {
            this.put(key, value, expirationInSeconds);
        }
    }

    /**
     * Removes an entry from the cache using the given key.
     * @param key The key to remove from the cache.
     */
    public remove(key: string): void {
        this.store.delete(key);
    }

    /**
     * Removes a set of entries from the cache.
     * @param keys The array of keys to remove.
     */
    public removeAll(keys: string[]) {
        for (const key of keys) {
            this.store.delete(key);
        }
    }

    /**
     * Внутрішній метод для очищення пам'яті від сміття
     */
    public _purgeExpired(): void {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiration) {
                this.store.delete(key);
            }
        }
    }
}