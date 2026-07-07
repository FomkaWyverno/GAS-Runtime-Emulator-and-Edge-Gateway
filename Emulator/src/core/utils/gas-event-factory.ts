import { DoPostEvent, PostData } from "../../emulator/@types/web-apps/events.types.js";


interface RawRequestInput {
    url: string;
    body: string;
    contentType: string;
}

export function createDoPostEvent(input: RawRequestInput): DoPostEvent {
    const parsedUrl = new URL(input.url, 'http://localhost');
    const queryString = parsedUrl.search ? parsedUrl.search.substring(1) : null;

    const parameter: Record<string, string> = {};
    const parameters: Record<string, string[]> = {};

    parsedUrl.searchParams.forEach((value, key) => {
        if (!parameters[key]) {
            parameters[key] = [];
        }
        parameters[key].push(value);

        if (!(key in parameter)) {
            parameter[key] = value;
        }
    });

    const pathSegments = parsedUrl.pathname.split('/');
    const execIndex = pathSegments.findIndex(seg => seg === 'exec' || seg === 'dev');
    const pathInfo = execIndex !== -1 ? pathSegments.slice(execIndex + 1).join('/') : '';

    const contentLength = Buffer.byteLength(input.body, 'utf-8');

    const postData: PostData = {
        length: contentLength,
        type: input.contentType || 'text/plain',
        contents: input.body,
        name: "postData"
    };

    return {
        queryString,
        parameter,
        parameters,
        pathInfo,
        contextPath: '',
        contentLength,
        postData
    }
}