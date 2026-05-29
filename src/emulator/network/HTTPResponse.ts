import { Blob } from "../utils/Blob.js";

export class HTTPResponse {
    private readonly allHeaders: Record<string, string | string[]>;
    private readonly simpleHeaders: Record<string, string>;

    constructor(
        private readonly body: Buffer,
        rawHeaders: Record<string, string | string[]>,
        private readonly statusCode: number
    ) {
        this.allHeaders = {};
        this.simpleHeaders = {};

        for (const key in rawHeaders) {
            const lowerKey = key.toLowerCase();
            const value = rawHeaders[key];

            this.allHeaders[lowerKey] = value;

            if (Array.isArray(value)) {
                this.simpleHeaders[lowerKey] = value[0];
            } else {
                this.simpleHeaders[lowerKey] = value;
            }
        }
    }

    /**
     * Returns an attribute/value map of headers for the HTTP response, with headers that have multiple values returned as arrays.
     * @returns A JavaScript key/value map of HTTP headers.
     */
    getAllHeaders(): Object {
        return this.allHeaders;
    }

    /**
     * Returns an attribute/value map of headers for the HTTP response.
     * @returns A JavaScript key/value map of HTTP headers.
     */
    getHeaders(): Object {
        return this.simpleHeaders;
    }

    /**
     * Return the data inside this object as a blob converted to the specified content type.
     * This method adds the appropriate extension to the filename—for example, "myfile.pdf".
     * However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced.
     * Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf".
     * 
     * To view the daily quotas for conversions, see Quotas for Google Services.
     * Newly created Google Workspace domains might be temporarily subject to stricter quotas.
     * 
     * @param contentType The MIME type to convert to.For most blobs, 'application/pdf' is the only valid option. For images in BMP, GIF, JPEG, or PNG format, any of 'image/bmp', 'image/gif', 'image/jpeg', or 'image/png' are also valid. For a Google Docs document, 'text/markdown' is also valid.
     */
    getAs(contentType: string): Blob {
        return new Blob(this.body, contentType, null);
    }

    /**
     * Return the data inside this object as a blob.
     * @returns The data as a blob.
     */
    getBlob(): Blob {
        return new Blob(this.body, this.simpleHeaders['content-type'] || null, null);
    }

    /**
     * Gets the raw binary content of an HTTP response.
     * @returns The content as a raw binary array.
     */
    getContent(): number[] {
        return this.getBlob().getBytes();
    }

    /**
     * Returns the content of an HTTP response encoded as a string of the given charset.
     * @param charset A string representing the charset to be used for encoding the HTTP response content.
     * @returns The content of the HTTP response, encoded using the given charset.
     */
    getContentText(charset: string = 'UTF-8'): string {
        return this.getBlob().getDataAsString(charset);
    }

    /**
     * Get the HTTP status code (200 for OK, etc.) of an HTTP response.
     * @returns The HTTP response code (for example, 200 for OK).
     */
    getResponseCode(): number {
        return this.statusCode;
    }
}