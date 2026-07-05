import { IncomingMessage } from "http";
import { DoPostEvent, PostData } from "../../../emulator/@types/web-apps/events.types.js";

class DoPostMapper {
    public getRawBody(req: IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => resolve(body));
            req.on('error', err => reject(err));
        });
    }

    public async mapToDoPostEvent(req: IncomingMessage, reqUrl: URL): Promise<DoPostEvent> {
        // Парсимо параметри
        const parameter: Record<string, string> = {};
        const parameters: Record<string, string[]> = {};

        reqUrl.searchParams.forEach((value, key) => {
            parameter[key] = value;
            if (!parameters[key]) {
                parameters[key] = [];
            }
            parameters[key].push(value);
        });

        // Парсимо pathInfo
        const pathParts = reqUrl.pathname.split('/');
        const execIndex = pathParts.findIndex(p => p === 'exec' || p === 'dev');
        const pathInfo = execIndex !== -1 ? pathParts.slice(execIndex + 1).join('/') : '';

        // Парсимо body
        const rawContents = await this.getRawBody(req);
        const contentLength = Buffer.byteLength(rawContents, 'utf-8');
        const contentType = req.headers['content-type'] || 'application/json';

        // Парсимо PostData
        const postData: PostData = {
            length: contentLength,
            type: contentType,
            contents: rawContents,
            name: "postData"
        }

        return {
            queryString: reqUrl.search || null,
            parameter: parameter,
            parameters: parameters,
            pathInfo: pathInfo,
            contextPath: '',
            contentLength: contentLength,
            postData: postData
        } satisfies DoPostEvent
    }
}

export default new DoPostMapper();