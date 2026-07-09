/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import HostPingHandler from "./handlers/HostPingHandler";
import RootHandler from "./handlers/RootHandler";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const pathname = url.pathname;

		console.log(`Pathname: ${pathname}`);

		if (request.method !== 'POST') return new Response('Method Not Allowed!', { status: 405 });
		if (pathname === '/host-ping') return HostPingHandler.handle(request, env);

		return RootHandler.handle(request, env);
	},
} satisfies ExportedHandler<Env>;
