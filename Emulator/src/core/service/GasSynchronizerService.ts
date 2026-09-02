import { sheets_v4 } from "googleapis";
import { GasAppendRowPayload, GasClearContentsPayload, GasDeleteColumnPayload, GasDeleteRowsPayload, GasEventsMap, GasInsertColumnsPayload, GasInsertSheetPayload as GasInsertSheetPayload, GasMoveColumnsPayload, GasUpdateRangePayload } from "../events/GasEventEmitter.js";
import GoogleSheetsService from "./GoogleSheetsService.js";
import RangeUtils from "../../emulator-utils/RangeUtils.js";
import { Cell } from "../../emulator/@types/sheets/cell.js";

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

        const metadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        //console.log(`[GasSynchronizerService] - SpreadsheetMetadata:`)
        //console.log(JSON.stringify(spreadsheetMetadata, null, 2));
        const sheet = metadata.sheets?.find(sheet => sheet.properties?.sheetId === sheet_id);
        const sheetName = sheet?.properties?.title;
        const gridProprties = sheet?.properties?.gridProperties;
        const currentMaxRows = gridProprties?.rowCount; // Скільки у реальній гугл таблиці скільки максимум рядків.
        const currentMaxCols = gridProprties?.columnCount;

        if (!sheetName || !gridProprties
            || currentMaxRows === null || currentMaxRows === undefined
            || currentMaxCols === null || currentMaxCols === undefined
        ) throw new Error(`Spreadsheet (spreadsheet_id: ${spreadsheet_id}) don't has sheet with sheet_id: ${sheet_id}`);

        const rawValues = this.mapCells(cells);
        const requiredMaxRow = row + rawValues.length - 1;

        if (requiredMaxRow > currentMaxRows) { // Якщо потрібно, щоб у таблиці було більше ніж поточна кількість рядків, тоді збільшуємо
            const rowsToAdd = requiredMaxRow - currentMaxRows;

            console.log(`[GasSynchronizerService] - Range exceeds grid limit (${requiredMaxRow} > ${currentMaxRows}). Appending +${rowsToAdd} rows...`);

            await GoogleSheetsService.insertRowsAtIndex(spreadsheet_id, sheet_id, currentMaxRows, requiredMaxRow);
            this.spreadsheetMetadataMap.delete(spreadsheet_id); // Інвалідуємо кеш після розширення таблиці, оскільки властивості змінились
        }

        console.log(`[GasSynchronizerService] - Spreadsheet (${spreadsheet_id}) sheet: "${sheetName}" rows: ${currentMaxRows} cols: ${currentMaxCols}`);

        const range = RangeUtils.toA1Notation({
            sheetName: sheetName,
            row: row,
            column: col,
            numColumns: rawValues[0].length,
            numRows: rawValues.length
        });

        await GoogleSheetsService.updateValues(spreadsheet_id, range, rawValues);
        console.log(`[GasSynchronizerService] - Successufully update range: ${range} for spreadsheet: ${metadata.properties?.title}`);
    }

    private async onInsertColumns(payload: GasInsertColumnsPayload) {
        const { spreadsheet_id, sheet_id, column_index, num_columns } = payload;
        console.log(`[GasSynchronizerService] - Start process event onInsertColumns (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} column_index: ${column_index} num_columns: ${num_columns})`);

        await GoogleSheetsService.insertColumns(spreadsheet_id, sheet_id, column_index - 1, column_index + num_columns - 1);
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
        console.log(`[GasSynchronizerService] - Start process event onAppendRow (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id})`);

        if (!cells || cells.length === 0) return;

        const spreadsheetMetadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        const sheet = spreadsheetMetadata.sheets?.find(s => s.properties?.sheetId === sheet_id);

        if (!sheet || !sheet.properties?.title) throw new Error(`Spreadsheet doesn't have a sheet with sheet_id: ${sheet_id}`);

        const sheetName = sheet.properties.title;

        const rawValues = this.mapCells([cells]);
        const range = `'${sheetName}'`;

        await GoogleSheetsService.appendRow(spreadsheet_id, range, [rawValues]);
        console.log(`[GasSynchronizerService] - Successufully append row in sheet '${sheetName}' in spreadsheet_id: ${spreadsheet_id}`);

    }

    private async onClearContents(payload: GasClearContentsPayload) {
        const { spreadsheet_id, sheet_id } = payload;
        console.log(`[GasSynchronizerService] - Start process event onClearContents (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id})`);

        const spreadsheetMetadata = await this.getSpreadsheetMetadata(spreadsheet_id);
        const sheet = spreadsheetMetadata.sheets?.find(s => s.properties?.sheetId === sheet_id);

        if (!sheet || !sheet.properties?.title) throw new Error(`Spreadsheet doesn't have a sheet with sheet_id: ${sheet_id}`);

        const sheetName = sheet.properties.title;
        const range = `'${sheetName}'`;

        await GoogleSheetsService.clearContents(spreadsheet_id, range);
        console.log(`[GasSynchronizerService] - Successufully clear contents in sheet '${sheetName}' in spreadsheet_id: ${spreadsheet_id}`);
    }

    private async onDeleteColumns(payload: GasDeleteColumnPayload) {
        const { spreadsheet_id, sheet_id, column_position, how_many } = payload;
        console.log(`[GasSynchronizerService] - Start process event onDeleteColumns (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} columnPosition: ${column_position} howMany: ${how_many})`);
        await GoogleSheetsService.deleteColumns(spreadsheet_id, sheet_id, column_position - 1, how_many);
        console.log(`[GasSynchronizerService] - Successufully delete columns in spreadsheet_id: "${spreadsheet_id}" for sheet_id: "${sheet_id}" Column position: "${column_position}" how many - "${how_many}"`)
    }

    private async onDeleteRows(payload: GasDeleteRowsPayload) {
        const { spreadsheet_id, sheet_id, row_position, how_many } = payload;
        console.log(`[GasSynchronizerService] - Start process event onDeleteRows (spreadsheet_id: ${spreadsheet_id} sheetId: ${sheet_id} rowPosition: ${row_position} howMany: ${how_many})`);
        await GoogleSheetsService.deleteRows(spreadsheet_id, sheet_id, row_position - 1, how_many);
        console.log(`[GasSynchronizerService] - Successufully delete rows in spreadsheet_id: "${spreadsheet_id}" for sheet_id: "${sheet_id}" Row position: "${row_position}" how many - "${how_many}"`)
    }

    private async onInsertSheet(payload: GasInsertSheetPayload) {
        const { spreadsheet_id, sheet_id, sheet_name, sheet_index, template_sheet_id } = payload;
        console.log(`[GasSynchronizerService] - Start process event onInsertSheet (spreadsheet_id: ${spreadsheet_id} newSheetName: ${sheet_name} newSheetId: ${sheet_id})`);
        if (template_sheet_id !== undefined) {
            await GoogleSheetsService.duplicateSheet(spreadsheet_id, template_sheet_id, sheet_index, sheet_id, sheet_name);
            console.log(`[GasSynchronizerService] - Successufully duplicate sheet (new SheetName: ${sheet_name} new SheetId: ${sheet_id}) in spreadsheet: "${spreadsheet_id}"`);
        } else {
            await GoogleSheetsService.insertSheet(spreadsheet_id, sheet_id, sheet_name, sheet_index);
            console.log(`[GasSynchronizerService] - Successufully insert new sheet (spreadsheet_id: ${spreadsheet_id} SheetName: ${sheet_name} SheetId: ${sheet_id}) in spreadsheet: "${spreadsheet_id}"`);
        }
        // Видаляємо, оскільки таблиця має тепер ще один аркуш, і кеш вже не валідний
        this.spreadsheetMetadataMap.delete(spreadsheet_id);
    }

    /**
     * Шукає у кеші метадані ел. таблиці, якщо її немає, тоді робить запит, та повертає метадані
     * @param spreadsheetId ідентифікатор ел. таблиці
     * @returns Метадані ел.таблиці
     */
    private async getSpreadsheetMetadata(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
        if (this.spreadsheetMetadataMap.has(spreadsheetId)) return this.spreadsheetMetadataMap.get(spreadsheetId)!;

        console.log(`[GasSynchronizerService] - Don't has in map SpreadsheetMetadata for "${spreadsheetId}"`);
        console.log(`[GasSynchronizerService] - Start pull metadata for spreadsheet: ${spreadsheetId}`);
        const spreadsheetMetadata = await GoogleSheetsService.getSpreadsheet(spreadsheetId);
        this.spreadsheetMetadataMap.set(spreadsheetId, spreadsheetMetadata);

        return spreadsheetMetadata;
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