import EventEmitter from "events";
import { Cell } from "../../emulator/@types/sheets/cell.js";
import { Range } from "../../emulator/sheets/Range.ts";

export interface GasUpdateRangePayload {
    spreadsheet_id: string;
    sheet_id: number;
    row: number;
    col: number;
    cells: Cell[][];
}

export interface GasInsertColumnsPayload {
    spreadsheet_id: string;
    sheet_id: number;
    column_index: number;
    num_columns: number;
}

export interface GasMoveColumnsPayload {
    spreadsheet_id: string;
    sheet_id: number;
    columnSpec: Range;
    destination_index: number;
}

export interface GasAppendRowPayload {
    spreadsheet_id: string;
    sheet_id: number;
    row: number;
    cells: Cell[]
}

export interface GasClearContentsPayload {
    spreadsheet_id: string;
    sheet_id: number;

}

export interface GasDeleteColumnPayload {
    spreadsheet_id: string;
    sheet_id: number;
    column_position: number;
    how_many: number;
}

export interface GasDeleteRowsPayload {
    spreadsheet_id: string;
    sheet_id: number;
    row_position: number;
    how_many: number;
}

export type GasEventsMap = {
    onUpdateRange: [payload: GasUpdateRangePayload];
    onInsertColumns: [payload: GasInsertColumnsPayload];
    onMoveColumns: [payload: GasMoveColumnsPayload];
    onAppendRow: [payload: GasAppendRowPayload];
    onClearContents: [payload: GasClearContentsPayload];
    onDeleteColumn: [payload: GasDeleteColumnPayload];
    onDeleteRows: [payload: GasDeleteRowsPayload];
}

export type StrictEventEmitter<T extends Record<string, any[]>> = {
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): StrictEventEmitter<T>;
    emit<K extends keyof T>(event: K, ...args: T[K]): boolean;
} & Omit<EventEmitter, 'on' | 'once' | 'off' | 'emit'>;

export default new EventEmitter() as StrictEventEmitter<GasEventsMap>;