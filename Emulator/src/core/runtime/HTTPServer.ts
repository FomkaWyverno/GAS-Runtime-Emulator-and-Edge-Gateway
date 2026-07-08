import http from 'http'
import DoPostMapper from './mappers/DoPostMapper.ts';
import SandboxGAS from './SandboxGAS.ts';
import { TextOutput } from '../../emulator/utils/ContentService.ts';
import AppConfig from '../config/AppConfig.ts';

class HTTPServer {

    private server: http.Server | null = null;


    public start(port: number): void {
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

            const result = SandboxGAS.execute('doPost', [doPostEvent]) as TextOutput | string | undefined; // Виконуємо команду

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

        this.server.listen(3000, () => console.log(`[HTTPServer] - Start HTTPServer on port: ${port}`));
    }

    public stop() {
        this.server?.close();
    }
}

export default new HTTPServer();

// const server = http.createServer((req, res) => {
//   // Нам потрібні тільки POST-запити з кодом для виконання
//   if (req.method === 'POST' && req.url === '/execute') {
//     let body = '';

//     req.on('data', chunk => { body += chunk.toString(); });
//     req.on('end', () => {
//       console.log(` Got script to execute: ${body}`);

//       // Тут буде твоя логіка емулятора (Gas Runtime)

//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ status: 'success', result: 'Виконано на ПК потужно!' }));
//     });
//   } else {
//     res.writeHead(404);
//     res.end();
//   }
// });

// server.listen(3000, () => {
//   console.log('🚀 HTTP сервер готовий на порту 3000 і чекає на Cloudflare!');
// });