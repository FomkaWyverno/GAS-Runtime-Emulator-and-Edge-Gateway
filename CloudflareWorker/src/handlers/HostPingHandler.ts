import { KVNamespaceKeys } from "../enums/KVNamespaceKeys";
import { Handler } from "./Handler";

export interface HostData {
    host_url: string;
    last_seen: number;
}


class HostPingHandler implements Handler {
    async handle(request: Request, env: Env): Promise<Response> {
        try {
            const authHeader = request.headers.get('Authorization');
            const expectedToken = `Bearer ${env["host-ping-token"]}`

            if (!authHeader || authHeader !== expectedToken) {
                console.warn(`[Ping Security] Unauthorized ping attempt`)
                return new Response(
                    JSON.stringify({ error: 'Unauthorized' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' }}
                );
            }

            const body = await request.json() as any;

            if (!body.host_id || !body.host_url) {
                return new Response(
                    JSON.stringify({ error: 'Missing required fields: host_id or host_url' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' }}
                );
            }

            const hostData = {
                host_url: body.host_url,
                last_seen: Date.now()
            } satisfies HostData;

            await env.KV_STORE.put(KVNamespaceKeys.HOST_PC, JSON.stringify(hostData), { expirationTtl: Number(env["telegram-bot-host-ping-expiration-ttl"]) });

            console.log(`[KV Store] - Successfully updated data for Host ${body.host_id}`)

            return new Response(
                JSON.stringify({ status: 'pong', saved: true }),
                { status: 200, headers: { 'Content-Type': 'application/json' }}
            );
        } catch (err: any) {
            console.error(`[Ping Error]: `, err?.message || err);
            return new Response(JSON.stringify({ error: 'Internal Error' }), { status: 500 });
        }
    }

}

export default new HostPingHandler();