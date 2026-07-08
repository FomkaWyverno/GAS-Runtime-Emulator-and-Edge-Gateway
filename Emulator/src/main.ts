import * as readline from 'readline'
import AppBootstrap from "./core/bootstrap/AppBootstrap.js";
import CloudflareTunnelService from "./core/runtime/CloudflareTunnelService.ts";
import HTTPServer from "./core/runtime/HTTPServer.ts";
import PingPongService from "./core/runtime/PingPongService.ts";

const PORT = 3000;


async function main() {
    console.log(`[Main] - AppBootstrap`);
    await AppBootstrap.boot();
    console.log(`[Main] - Start ClouflareTunnel`)
    const tunnelURL = await CloudflareTunnelService.startTunnel(PORT);
    console.log(`[Main] - Started tunnel: ${tunnelURL}`);
    console.log(`[Main] - Start HTTP Server`)
    HTTPServer.start(PORT);
    
    console.log(`[Main] - Start PingPongService`)
    PingPongService.setTunnelURL(tunnelURL);
    PingPongService.start();

    registerStopCommand();
}

function registerStopCommand() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', async (line) => {
        const command = line.trim();

        if (command !== '/stop') {
            console.log(`Print /stop to stop program`);
            return;
        }
        console.log(`[Main] - Stopping all services...`);

        console.log(`[Main] - Stop PingPongService`)
        PingPongService.stop();

        console.log(`[Main] - Stop CloudflareTunnelService`)
        CloudflareTunnelService.stop();

        console.log(`[Main] - Stop HTTP Server`);
        HTTPServer.stop();

        rl.close();
    });
}

main();