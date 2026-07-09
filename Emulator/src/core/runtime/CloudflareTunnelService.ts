import { ChildProcess, spawn } from "child_process";

class CloudflareTunnelService {
    private tunnelProcess: ChildProcess | null = null;
    private tunnelUrl: string | null = null;

    public async startTunnel(port: number): Promise<string> {
        if (this.tunnelUrl) return this.tunnelUrl;

        return new Promise<string>((resolve, reject) => {
            this.tunnelProcess = spawn(`cloudflared`, ['tunnel', '--url', `http://127.0.0.1:${port}`]);
            let isResolved = false;

            this.tunnelProcess.stderr?.on('data', async (chunk: Buffer) => {
                if (isResolved) return; // Якщо проміс вже оброблений скіпаємо

                const data = chunk.toString();
                const match = data.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
                if (match) {
                    isResolved = true;
                    this.tunnelUrl = match[0]
                    resolve(this.tunnelUrl)
                }
            });

            this.tunnelProcess.on('error', (err) => {
                if (!isResolved) {
                    isResolved = true;
                    reject(`Failed to start cloudflared process: ${err.message}`);
                }
            })

            this.tunnelProcess.on('close', (code) => {
                this.cleanUp();
                if (!isResolved) {
                    isResolved = true;
                    reject(`Process tunnel is closed with code: ${code}`);
                }
            });
        });
    }

    public getUrl(): string | null {
        return this.tunnelUrl;
    }

    public stop(): void {
        if (this.tunnelProcess) {
            this.tunnelProcess.kill('SIGTERM');
            this.cleanUp();
            console.log(`[CloudflareTunnelService] - Tunnel stopped`);
        }
    }

    private cleanUp(): void {
        this.tunnelUrl = null;
        this.tunnelProcess = null;
    }
}

export default new CloudflareTunnelService();