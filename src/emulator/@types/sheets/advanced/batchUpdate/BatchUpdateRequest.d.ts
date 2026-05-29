import { RequestContainer } from "./RequestContainer.js";

export interface BatchUpdateRequest {
    requests: RequestContainer[];
}