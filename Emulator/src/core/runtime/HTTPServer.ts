import http from 'http'
import DoPostMapper from './mappers/DoPostMapper.js';
import SandboxGAS from './SandboxGAS.js';
import { TextOutput } from '../../emulator/utils/ContentService.js';
import AppConfig from '../config/AppConfig.js';
import { resolve } from 'dns';

class HTTPServer {

    private server: http.Server | null = null;


    public async start(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = http.createServer(async (req, res) => {
                if (req.method !== 'POST') {
                    res.writeHead(405, { 'content-type': 'text/plain' });
                    res.end('Method Not Allowed')
                    return; // Приймаємо лише ПОСТ
                }

                const requestAuthToken = req.headers['x-auth-token'];
                const authToken = AppConfig.cloudflare.host_request_token;

                if (authToken !== requestAuthToken) {
                    res.writeHead(403, { 'content-type': 'text/plain' });
                    res.end('Access Denied');
                    return;
                }

                const doPostEvent = await DoPostMapper.mapToDoPostEvent(req, new URL(req.url || '', `http://${req.headers.host}`)); // Мапиво у GAS івент

                let result: TextOutput | string | undefined;
                try {
                    console.log(`[HTTPServer] - Start SandboxGAS run function - doPost`);
                    result = SandboxGAS.execute('doPost', [doPostEvent]) as TextOutput | string | undefined; // Виконуємо команду
                } catch (vmError: any) {
                    console.error(`[HTTPServer] - Error during GAS Sandbox execution:`);
                    console.error(vmError.stack || vmError.message || vmError);

                    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                    res.end('Internal Server Error inside Sandbox!');
                    return;
                }


                if (!result) {
                    res.writeHead(200, { "content-type": 'text/plain' }); // якщо результату немає просто повертає інфу що все ок.
                    res.end();
                    return;
                }

                let content = '';
                let contentType = 'text/plain; charset=utf-8'; // Якщо є якась відповідь пробуємо її обробити та повернути правильно.

                if (typeof result === 'string') {
                    content = result;
                } else if (typeof result.getContent === 'function') {
                    content = result.getContent();
                    contentType = `${result.getMimeType()}; charset=utf-8`;
                } else {
                    content = JSON.stringify(result)
                    contentType = `application/json; charset=utf8`;
                }

                res.writeHead(200, {
                    'content-type': contentType,
                    'access-control-allow-origin': '*'
                });

                res.end(content);
                return;
            });

            this.server.on('error', err => {
                console.error(`[HTTPServer] - Failed to start server:`, err)
                reject(err);
            })

            this.server.listen(3000, () => {
                console.log(`[HTTPServer] - Start HTTPServer on port: ${port}`);
                resolve();
            });
        });
    }

    public stop() {
        this.server?.close();
        console.log(`[HTTPServer] - HTTPServer stopped`)
    }
}

export default new HTTPServer();