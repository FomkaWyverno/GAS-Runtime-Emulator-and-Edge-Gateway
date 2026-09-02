import { KVNamespaceKeys } from "../enums/KVNamespaceKeys";
import { Handler } from "./Handler";
import { HostData } from "./HostPingHandler";
import { fetchWithTimeout } from "../network/fetchWithTimeout";

interface DetermineURLs {
    host_url?: string;
    apps_script_host_url: string;
}

class RootHandler implements Handler {
    async handle(request: Request, env: Env): Promise<Response> {
        console.log(`[RootHandler] - Handling request`);
        const headers: Record<string, string> = {};
        const body = await request.json() as any; // Telegram body
        for (let [key, value] of request.headers.entries()) {
            headers[key.toLowerCase()] = value;
        }


        const webhook_secret = env['telegram_bot_secret']
        const tg_api_webhook_secret = headers['x-telegram-bot-api-secret-token']

        if (webhook_secret !== tg_api_webhook_secret) {
            console.log(`[RootHandler] - WebhookSecret dont correct!`)
            return new Response('Access Denied', { status: 403 });
        }



        const urlConfig = await this.determineURLs(env);
        const urlsToTry = [urlConfig.host_url, urlConfig.apps_script_host_url].filter(Boolean) as string[];

        body._gateaway = {
            headers: headers
        }

        let response: Response | null = null;
        let lastError: any = null;
        for (const url of urlsToTry) {
            try {
                console.log(`[Gateway] - Attempt request to: ${url}`);

                const requestHeaders: Record<string, string> = {
                    'Content-Type': 'application/json'
                }

                if (url === urlConfig.host_url) {
                    requestHeaders['X-Auth-Token'] = env['host_request_token']
                }

                response = await fetchWithTimeout(url, {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(body)
                }, 30000);

                const GATEWAY_ERRORS = [502, 503, 504, 530];

                if (GATEWAY_ERRORS.includes(response.status) && url !== env['telegram_bot_gas_url']) {
                    console.error(`[Gateway] - Server is OFFLINE or Tunnel dead. Status: ${response.status}. Switch to GAS url...`);
                    continue;
                }

                console.log(`[Gateway] - Successfuly got response from ${url} with status: ${response.status}`);
                break;
            } catch (err: any) {
                lastError = err;
                if (err.name === 'AbortError') {
                    console.warn(`[Gateway] - Timeout is expired for host: ${url}. Attempting next url...`);
                } else {
                    console.warn(`[Gateway] - Network error for ${url}: ${err.message || err}`)
                }
            }
        }

        if (!response) {
            console.error(`[Gateway] - None of the hosts responded`);
            return new Response(
                JSON.stringify({ error: 'All backends are offline', details: lastError?.message }),
                { status: 502, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const responseText = await response.text();
        return new Response(responseText, { status: response.status, headers: response.headers })

    }

    private async determineURLs(env: Env): Promise<DetermineURLs> {
        const hostRaw = await env.KV_STORE.get(KVNamespaceKeys.HOST_PC);
        const host = hostRaw ? JSON.parse(hostRaw) as HostData : null;
        const expirationTTL = Number(env['telegram_bot_host_ping_expiration_ttl'])

        const determineURLs: DetermineURLs = {
            apps_script_host_url: ""
        };
        if (host && host.last_seen < Date.now() - expirationTTL) determineURLs.host_url = host.host_url;
        determineURLs.apps_script_host_url = env['telegram_bot_gas_url'];

        return determineURLs;
    }
}

export default new RootHandler();