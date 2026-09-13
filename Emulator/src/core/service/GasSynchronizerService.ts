import { sheets_v4 } from "googleapis";
import { GasAppendRowPayload, GasClearContentsPayload, GasDeleteColumnPayload, GasDeleteRowsPayload, GasEventsMap, GasInsertColumnsPayload, GasInsertSheetPayload as GasInsertSheetPayload, GasMoveColumnsPayload, GasUpdateRangePayload } from "../events/GasEventEmitter.js";
import GoogleSheetsService from "./GoogleSheetsService.js";
import { Cell } from "../../emulator/@types/sheets/cell.js";
import SpreadsheetMetaRegistry from "./SpreadsheetMetaRegistry.ts";

type SyncTask = {
    [K in keyof GasEventsMap]: {
        type: K;
        payload: GasEventsMap[K][0];
    }
}[keyof GasEventsMap];

class GasSynchronizerService {
    private spreadsheetMetadataMap: Map<string, sheets_v4.Schema$Spreadsheet> = new Map();
    private queue: SyncTask[] = [];
    private isProcessing = false;

    public enqueue<K extends keyof GasEventsMap>(type: K, payload: GasEventsMap[K][0]) {
        this.queue.push({ type, payload } as SyncTask);
        console.log(`[GasSynchronizer] - Append to queue ${type}. Summary in queue: ${this.queue.length}`);

        this.processQueue();
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            while (this.queue.length > 0) {
                const task = this.queue.shift();
                if (!task) continue;

                switch (task.type) {
                    case "onUpdateRange": {
                        await this.onUpdateRange(task.payload);
                        break;
                    }
                    case "onInsertColumns": {
                        await this.onInsertColumns(task.payload);
                        break;
                    }
                    case "onMoveColumns": {
                        await this.onMoveColumns(task.payload);
                        break;
                    }
                    case "onAppendRow": {
                        this.onAppendRow(task.payload);
                        break;
                    }
                    case "onClearContents": {
                        await this.onClearContents(task.payload);
                        break
                    }
                    case "onDeleteColumns": {
                        await this.onDeleteColumns(task.payload);
                        break
                    }
                    case "onDeleteRows": {
                        await this.onDeleteRows(task.payload);
                        break
                    }
                    case "onInsertSheet": {
                        await this.onInsertSheet(task.payload);
                        break;
                    }
                }
            }
        } finally {
            this.isProcessing = false;
        }

    }

    private async onUpdateRange(payload: GasUpdateRangePayload) {
        const { spreadsheet_id, sheet_id, row, col, cells } = payload;
        console.log(`[GasSynchronizerService] - Start process event onUpdateRange (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} row: ${row} col: ${col})`);

        GoogleSheetsService.lateUpdateValuesEnsureFit(
            spreadsheet_id,
            sheet_id,
            row - 1,
            row - 1 + cells.length,
            col - 1,
            col - 1 + cells[0].length,
            this.mapCells(cells)
        );

        console.log(`[GasSynchronizerService] - Successufully update range: row: ${row}, col: ${col}, rowNums: ${cells.length}, colNums: ${cells[0].length}, for spreadsheet: ${spreadsheet_id}`);
    }

    private async onInsertColumns(payload: GasInsertColumnsPayload) {
        const { spreadsheet_id, sheet_id, column_index, num_columns } = payload;
        console.log(`[GasSynchronizerService] - Start process event onInsertColumns (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} column_index: ${column_index} num_columns: ${num_columns})`);

        GoogleSheetsService.lateInsertColumns(spreadsheet_id, sheet_id, column_index - 1, column_index + num_columns - 1);
        console.log(`[GasSynchronizerService] - Successufully insert at position ${column_index} ${num_columns} columns in spreadsheet_id: ${spreadsheet_id}.`);
    }

    private async onMoveColumns(payload: GasMoveColumnsPayload) {
        const { spreadsheet_id, sheet_id, columnSpec, destination_index } = payload;
        console.log(`[GasSynchronizerService] - Start process event onMoveColumns (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id})`);

        const startCol = columnSpec.getColumn();
        const numCols = columnSpec.getNumColumns();

        const googleStartIndex = startCol - 1;
        const googleEndIndex = googleStartIndex + numCols;
        const googleDestinationIndex = destination_index - 1;

        GoogleSheetsService.moveColumns(
            spreadsheet_id,
            sheet_id,
            googleStartIndex,
            googleEndIndex,
            googleDestinationIndex
        );

        console.log(`[GasSynchronizerService] - Successufully move columns from column index ${startCol} number of columns ${numCols}`);
    }

    private async onAppendRow(payload: GasAppendRowPayload) {
        const { spreadsheet_id, sheet_id, row, cells } = payload;
        console.log(`[GasSynchronizerService] - Start process event onAppendRow (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id})`);

        if (!cells || cells.length === 0) return;

        const rawValues = this.mapCells([cells]);

        GoogleSheetsService.lateUpdateValuesEnsureFit(
            spreadsheet_id,
            sheet_id,
            row - 1,
            row,
            0,
            cells.length,
            rawValues
        )

        console.log(`[GasSynchronizerService] - Successfully queued append row in sheet_id: ${sheet_id} in spreadsheet_id: ${spreadsheet_id}`);

    }

    private async onClearContents(payload: GasClearContentsPayload) {
        const { spreadsheet_id, sheet_id } = payload;
        console.log(`[GasSynchronizerService] - Start process event onClearContents (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id})`);

        const metaSheet = SpreadsheetMetaRegistry.getSheetMeta(spreadsheet_id, sheet_id);

        if (!metaSheet) {
            throw new Error(`[GasSynchronizerService] - Cannot clear contents: no sheet meta found for spreadsheet_id: ${spreadsheet_id}, sheet_id: ${sheet_id}`);
        }
        
        GoogleSheetsService.lateClearContents(
            spreadsheet_id,
            sheet_id,
            0,
            metaSheet.rowCount,
            0,
            metaSheet.columnCount
        );
        console.log(`[GasSynchronizerService] - Successfully queued clear contents in sheet_id: ${sheet_id} in spreadsheet_id: ${spreadsheet_id}`);
    }

    private async onDeleteColumns(payload: GasDeleteColumnPayload) {
        const { spreadsheet_id, sheet_id, column_position, how_many } = payload;
        console.log(`[GasSynchronizerService] - Start process event onDeleteColumns (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} columnPosition: ${column_position} howMany: ${how_many})`);
        GoogleSheetsService.lateDeleteColumns(spreadsheet_id, sheet_id, column_position - 1, how_many);
        console.log(`[GasSynchronizerService] - Successufully delete columns in spreadsheet_id: "${spreadsheet_id}" for sheet_id: "${sheet_id}" Column position: "${column_position}" how many - "${how_many}"`)
    }

    private async onDeleteRows(payload: GasDeleteRowsPayload) {
        const { spreadsheet_id, sheet_id, row_position, how_many } = payload;
        console.log(`[GasSynchronizerService] - Start process event onDeleteRows (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} rowPosition: ${row_position} howMany: ${how_many})`);
        GoogleSheetsService.lateDeleteRows(spreadsheet_id, sheet_id, row_position - 1, how_many);
        console.log(`[GasSynchronizerService] - Successufully delete rows in spreadsheet_id: "${spreadsheet_id}" for sheet_id: "${sheet_id}" Row position: "${row_position}" how many - "${how_many}"`)
    }

    private async onInsertSheet(payload: GasInsertSheetPayload) {
        const { spreadsheet_id, sheet_id, sheet_name, sheet_index, template_sheet_id } = payload;
        console.log(`[GasSynchronizerService] - Start process event onInsertSheet (spreadsheet_id: ${spreadsheet_id} newSheetName: ${sheet_name} newSheetId: ${sheet_id})`);
        if (template_sheet_id !== undefined) {
            await GoogleSheetsService.lateDuplicateSheet(spreadsheet_id, template_sheet_id, sheet_index, sheet_id, sheet_name);
            console.log(`[GasSynchronizerService] - Successufully duplicate sheet (new SheetName: ${sheet_name} new SheetId: ${sheet_id}) in spreadsheet: "${spreadsheet_id}"`);
        } else {
            GoogleSheetsService.lateInsertSheet(spreadsheet_id, sheet_id, sheet_name, sheet_index);
            console.log(`[GasSynchronizerService] - Successufully insert new sheet (spreadsheet_id: ${spreadsheet_id} SheetName: ${sheet_name} SheetId: ${sheet_id}) in spreadsheet: "${spreadsheet_id}"`);
        }
    }

    /**
     * Мапить матрицю комірок у матрицю рядків для АПІ Гугл Таблиць
     * @param cells матриця комірок
     * @returns матрицю рядків
     */
    private mapCells(cells: Cell[][]): any[][] {
        return cells.map(row => row.map(cell => {
            const val = cell.value;

            if (val === undefined || val === null) return '';

            if (cell.value_type === 'DATE' || val as any instanceof Date || (typeof val === 'string' && this.isIsoDateString(val))) {
                const dateObj = new Date(val);
                if (!isNaN(dateObj.getTime())) {
                    return this.formatDateForSheets(dateObj);
                }
            }

            return val;
        }));
    }

    /**
     * Перетворює Date у рядок, який Google Sheets з `USER_ENTERED` розпізнає як дату
     * Формат: "DD.MM.YYYY HH:mm:ss"
     */
    private formatDateForSheets(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }

    private isIsoDateString(val: string): boolean {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);
    }
}

export default new GasSynchronizerService();