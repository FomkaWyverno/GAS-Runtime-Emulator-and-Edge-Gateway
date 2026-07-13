import EventEmitter from "events";
import { CellValueType } from "../../emulator/@types/sheets/cell.entity.js";

export interface Cell {
    row: number;
    col: number;
    value: string;
    value_type: CellValueType;
}

export interface GasUpdateRange {
    spreadsheet_id: string;
    sheet_id: number;
    cells: Cell[];
}

export type GasEventsMap = {
    update_range: [payload: GasUpdateRange];
}

export type StrictEventEmitter<T extends Record<string, any[]>> = {
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    emit<K extends keyof T>(event: K, ...args: T[K]): boolean;
} & Omit<EventEmitter, 'on' | 'once' | 'off' | 'emit'>;

export default new EventEmitter() as StrictEventEmitter<GasEventsMap>;