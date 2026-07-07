import AppConfig from "../config/AppConfig.ts";


class PingPongService {
    private tunnelURL: string | null = null;
    private interval: NodeJS.Timeout | null = null;

    public setTunnelURL(tunnelURL: string) {
        this.tunnelURL = tunnelURL;
    }

    public start() {
        if (!this.tunnelURL) {
            console.warn(`[PingPongService] - Can't start PingPongService without tunnel URL`);
        }

        const workerURL = AppConfig.cloudflare.worker_url;

        this.interval = setInterval(async () => {
            const response = await fetch(`${workerURL}/host-ping`, {
                'method': 'POST',
                'headers': { 'Authorization': `Bearer ${AppConfig.cloudflare.token}` },
                'body': JSON.stringify({
                    'host_id': 'my-id',
                    'host_url': this.tunnelURL
                })
            });

            console.log(`[PingPongService] - Ping Cloudflare worker response code: ${response.status}`)
        }, 150000);
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log(`[PingPongService] - Service stopped`);
        }
    }
}

export default new PingPongService();