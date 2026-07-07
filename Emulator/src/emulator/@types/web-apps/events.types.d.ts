export interface PostData {
    /** The same as e.contentLength */
    length: number;
    /** The MIME type of the POST body */
    type: string;
    /** The content text of the POST body */
    contents: string;
    /** Always the value "postData" */
    name: "postData";
}

export interface DoPostEvent {
    /** The value of the query string portion of the URL, or null if no query string is specified */
    queryString: string | null,
    /** An object of key/value pairs that correspond to the request parameters. Only the first value is returned for parameters that have multiple values. */
    parameter: Record<string, string>;
    /** An object similar to e.parameter, but with an array of values for each key */
    parameters: Record<string, string[]>;
    /** The URL path after /exec or /dev. For example, if the URL path ends in /exec/hello, the path info is hello. */
    pathInfo: string;
    /** Not used, always the empty string. */
    contextPath: '',
    /** The length of the request body for POST requests, or -1 for GET requests */
    contentLength: number;
    /** Data */
    postData: PostData;
}