declare module 'sync-fetch' {
    interface SyncFetchOptions {
        method?: string;
        headers?: Record<string, string | string[]>;
        body?: any;
        redirect?: 'follow' | 'manual' | 'error';
        timeout?: number;
        compress?: boolean;
        size?: number;
        agent?: any;
    }

    interface SyncResponse {
        ok: boolean;
        status: number;
        statusText: string;
        headers: {
            get(name: string): string | null;
            raw(): Record<string, string[]>;
        };
        buffer(): Buffer;
        json(): any;
        text(): string;
    }

    function syncFetch(url: string, options?: SyncFetchOptions): SyncResponse;

    export default syncFetch;
}