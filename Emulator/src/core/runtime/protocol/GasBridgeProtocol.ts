
export enum GasBridgeMessageType {
    FORWARD_REQUEST = "FORWARD_REQUEST",
    FORWARD_RESPONSE = 'FORWARD_RESPONSE',
    PING = "PING",
    PONG = "PONG"
}

export interface GasEventPayload {
    queryString: string;
    parameter: Record<string, string>;
    parameters: Record<string, string[]>;
    pathInfo: string | null;
    contextPath: string;
    contentLength: number;

    postData?: {
        length: number;
        type: string;
        contents: string;
        name: 'postData';
    };
}

export interface GasBridgeRequest {
    type: GasBridgeMessageType.FORWARD_REQUEST;
    token: string;
    requestId: string;
    method: 'doPost' | 'doGet';
    payload: GasEventPayload;
}

export interface GasBridgeResponse {
    type: GasBridgeMessageType.FORWARD_RESPONSE;
    token: string;
    requestId: string;
    status: 'success' | 'error';
    data?: any;
    error?: string;
}

export type GasBridgePacket =
    | GasBridgeRequest
    | GasBridgeResponse
    | { type: GasBridgeMessageType.PING; token: string }
    | { type: GasBridgeMessageType.PONG; token: string };