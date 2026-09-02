import syncFetch from 'sync-fetch'
import { URLFetchRequestOptions } from "../@types/URLFetchRequestOptions.js";
import { Blob } from "../utils/Blob.js";
import { HTTPResponse } from './HTTPResponse.js';

export class UrlFetchApp {
    static fetch(url: string, params: URLFetchRequestOptions = {}) {
        const method = (params.method || 'get').toLowerCase();
        const followRedirects = params.followRedirects !== false; // default: true
        const muteHttpExceptions = params.muteHttpExceptions === true; // default: false
        
        // 1 Normalization headers to lowercase
        const requestHeaders: Record<string, string> = {};
        if (params.headers) {
            for (const key in params.headers) {
                requestHeaders[key.toLowerCase()] = params.headers[key];
            }
        }

        // Setup content-type
        if (params.contentType) {
            requestHeaders['content-type'] = params.contentType;
        } else if (!requestHeaders['content-type']) {
            requestHeaders['content-type'] = 'application/x-www-form-urlencoded'
        }

        let body: any = params.payload || null;

        // 2 Process payload
        if (body) {
            if (Array.isArray(body) || ArrayBuffer.isView(body)) {
                body = Buffer.from(body as any);
            } else if (typeof body === 'object' && !(body instanceof Buffer)) {
                if (body instanceof Blob) {
                    body = Buffer.from(body.getBytes());
                } else if (requestHeaders['content-type']?.includes('application/x-www-form-urlencoded')) {
                    const searchParams = new URLSearchParams();
                    for (const key in body) {
                        searchParams.append(key, body[key]);
                    }
                    body = searchParams.toString();
                }
            }
        }

        try {
            const response = syncFetch(url, {
                method: method,
                headers: requestHeaders,
                body: body, 
                redirect: followRedirects ? 'follow' : 'manual'
            });

            const responseHeaders: Record<string, string | string[]> = {};
            const rawHeaders = response.headers.raw();

            for (const key in rawHeaders) {
                const lowerKey = key.toLowerCase();
                const values = rawHeaders[key];

                responseHeaders[lowerKey] = values.length > 1 ? values : values[0];
            }

            const httpResponse = new HTTPResponse(
                response.buffer(),
                responseHeaders,
                response.status
            );

            if (!muteHttpExceptions && (response.status < 200 || response.status >= 300)) {
                throw new Error(`Request failed for ${url} returned code ${response.status}.`);
            }

            return httpResponse;
            
        } catch (e) {
            throw e;
        }
    }
}