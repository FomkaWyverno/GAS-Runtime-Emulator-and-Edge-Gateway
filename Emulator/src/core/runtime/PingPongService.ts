import AppConfig from "../config/AppConfig.js";
import os from 'os'

class PingPongService {
    private tunnelURL: string | null = null;
    private interval: NodeJS.Timeout | null = null;

    public setTunnelURL(tunnelURL: string) {
        this.tunnelURL = tunnelURL;
    }

    /**
     * Доступ до виклику пінгу для зовнішнього доступа
     */
    public async ping() {
        this.pingServer(AppConfig.cloudflare.worker_url);
    }

    private async pingServer(workerURL: string): Promise<void> {
        const response = await fetch(`${workerURL}/host-ping`, {
                'method': 'POST',
                'headers': { 
                    'Authorization': `Bearer ${AppConfig.cloudflare.host_ping_token}`,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                'body': JSON.stringify({
                    'host_id': os.hostname(),
                    'host_url': this.tunnelURL
                })
            });

            console.log(`[PingPongService] - Ping Cloudflare worker response code: ${response.status}`)
    }

    public start() {
        if (!this.tunnelURL) {
            console.warn(`[PingPongService] - Can't start PingPongService without tunnel URL`);
        }

        const workerURL = AppConfig.cloudflare.worker_url;

        this.pingServer(workerURL);

        this.interval = setInterval(async () => {
            this.pingServer(workerURL);
        }, 150000);
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log(`[PingPongService] - PingPongService stopped`);
        }
    }
}

export default new PingPongService();