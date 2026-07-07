export interface Handler {
    async handle(request: Request, env: Env): Promise<Response>;
}