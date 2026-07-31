import { sheets_v4 } from "googleapis";
import { GasAppendRowPayload, GasClearContentsPayload, GasEventsMap, GasInsertColumnsPayload, GasMoveColumnsPayload, GasUpdateRangePayload } from "../events/GasEventEmitter.ts";
import GoogleSheetsService from "./GoogleSheetsService.ts";
import RangeUtils from "../../emulator-utils/RangeUtils.ts";

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

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        this.isProcessing = true;

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
                case "onDeleteColumn": {

                    break
                }
                case "onDeleteRows": {

                    break
                }
            }
        }
    }

    private async onUpdateRange(payload: GasUpdateRangePayload) {
        const { spreadsheet_id, sheet_id, row, col, cells } = payload;

        const spreadsheetMetadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        const sheetName = spreadsheetMetadata.sheets?.find(sheet => sheet.properties?.sheetId === sheet_id)?.properties?.title;

        if (!sheetName) throw new Error(`Spreadsheet don't has sheet with sheet_id: ${sheet_id}`);

        const rawValues: any[][] = cells.map(row => row.map(cell => cell.value));

        const range = RangeUtils.toA1Notation({
            sheetName: sheetName,
            row: row,
            column: col,
            numColumns: rawValues[0].length,
            numRows: rawValues.length
        });

        await GoogleSheetsService.updateValues(spreadsheet_id, range, rawValues);
        console.log(`[GasSynchronizerService] - Successufully update range: ${range} for spreadsheet: ${spreadsheetMetadata.properties?.title}`);
    }

    private async onInsertColumns(payload: GasInsertColumnsPayload) {
        const { spreadsheet_id, sheet_id, column_index, num_columns } = payload;

        await GoogleSheetsService.insertColumns(spreadsheet_id, sheet_id, column_index - 1, column_index + num_columns - 1);
        console.log(`[GasSynchronizerService] - Successufully insert at position ${column_index} ${num_columns} columns in spreadsheet_id: ${spreadsheet_id}.`);
    }

    private async onMoveColumns(payload: GasMoveColumnsPayload) {
        const { spreadsheet_id, sheet_id, columnSpec, destination_index } = payload;
        const startCol = columnSpec.getColumn();
        const numCols = columnSpec.getNumColumns();

        const googleStartIndex = startCol - 1;
        const googleEndIndex = googleStartIndex + numCols;
        const googleDestinationIndex = destination_index - 1;

        await GoogleSheetsService.moveColumns(
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

        if (!cells || cells.length === 0) return;

        const spreadsheetMetadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        const sheet = spreadsheetMetadata.sheets?.find(s => s.properties?.sheetId === sheet_id);

        if (!sheet || !sheet.properties?.title) throw new Error(`Spreadsheet doesn't have a sheet with sheet_id: ${sheet_id}`);

        const sheetName = sheet.properties.title;

        const rawValues = cells.map(cell => cell.value);
        const range = `'${sheetName}'`;

        await GoogleSheetsService.appendRow(spreadsheet_id, range, [rawValues]);
        console.log(`[GasSynchronizerService] - Successufully append row in sheet '${sheetName}' in spreadsheet_id: ${spreadsheet_id}`);

    }

    private async onClearContents(payload: GasClearContentsPayload) {
        const { spreadsheet_id, sheet_id } = payload;

        const spreadsheetMetadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        const sheet = spreadsheetMetadata.sheets?.find(s => s.properties?.sheetId === sheet_id);

        if (!sheet || !sheet.properties?.title) throw new Error(`Spreadsheet doesn't have a sheet with sheet_id: ${sheet_id}`);

        const sheetName = sheet.properties.title;
        const range = `'${sheetName}'`;

        await GoogleSheetsService.clearContents(spreadsheet_id, range);
        console.log(`[GasSynchronizerService] - Successufully clear contents in sheet '${sheetName}' in spreadsheet_id: ${spreadsheet_id}`);
    }

    /**
     * Шукає у кеші метадані ел. таблиці, якщо її немає, тоді робить запит, та повертає метадані
     * @param spreadsheetId ідентифікатор ел. таблиці
     * @returns Метадані ел.таблиці
     */
    private async getSpreadsheetMetadata(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
        if (this.spreadsheetMetadataMap.has(spreadsheetId)) return this.spreadsheetMetadataMap.get(spreadsheetId)!;

        const spreadsheetMetadata = await GoogleSheetsService.getSpreadsheet(spreadsheetId);
        this.spreadsheetMetadataMap.set(spreadsheetId, spreadsheetMetadata);

        return spreadsheetMetadata;
    }
}

export default new GasSynchronizerService();