import { google, sheets_v4 } from "googleapis";
import SpreadsheetMetaRegistry from "./SpreadsheetMetaRegistry.ts";


class GoogleSheetsService {
    public static readonly DEFAULT_NEW_SHEET_ROW_COUNT = 1000;
    public static readonly DEFAULT_NEW_SHEET_COLUMN_COUNT = 26;

    private sheets: sheets_v4.Sheets;
    /** Ключ це spreadsheet_id значення Реквест оновлення для батчу */
    private updateQueue: Map<string, sheets_v4.Schema$Request[]> = new Map();

    private isWorkerRunning = false;
    private isProcessingBatch = false;
    private workerIntervalMs = 90000; // Раз в півтори хв.
    private batchUpdateWorker: NodeJS.Timeout | undefined;

    constructor() {
        const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

        const authClient = new google.auth.GoogleAuth({
            scopes: SCOPES
        });

        this.sheets = google.sheets({
            version: 'v4',
            auth: authClient
        });
    }

    /**
     * Логіка одного тіка обробки черги
     */
    private async processQueueTick() {
        if (this.isProcessingBatch) {
            console.log("[GoogleSheetsService-Worker] Previous batch is still processing, skipping this tick.");
            return;
        }
        if (this.updateQueue.size === 0) return;
        this.isProcessingBatch = true;

        try {
            // 1. Атомарно забираємо поточний зріз черги, а саму мапу очищаємо або залишаємо нові запити
            const spreadsheetsInQueue = Array.from(this.updateQueue.keys()).slice(0, 40);

            for (const spreadsheet_id of spreadsheetsInQueue) {
                const requests = this.updateQueue.get(spreadsheet_id);
                // Видаляємо з мапи ОДРАЗУ перед запитом, 
                // щоб нові реквести, які прилетять під час await, не затерлися цим видаленням
                this.updateQueue.delete(spreadsheet_id);

                if (!requests || requests.length === 0) continue;

                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: spreadsheet_id,
                    requestBody: {
                        requests
                    },
                });

                console.log(`[GoogleSheetsService-Worker] - Successfully sent batch request ${requests.length} size for spreadsheet: ${spreadsheet_id}`)

                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (e) {
            console.error(`[GoogleSheetsService-Worker] Error: `, e);
            throw e;
        } finally {
            this.isProcessingBatch = false;
        }
    }

    /**
     * Додає запит на оновлення у чергу для воркера
     * @param spreadsheetId 
     * @param request 
     */
    private appendRequestToUpdateBatch(spreadsheetId: string, request: sheets_v4.Schema$Request) {
        if (this.updateQueue.has(spreadsheetId)) {
            this.updateQueue.get(spreadsheetId)!.push(request);
        } else {
            this.updateQueue.set(spreadsheetId, [request]);
        }
    }

    /**
     * Запускає воркера який буде з інтервалом робити батчАпдейти, якщо є на черзі щось.
     */
    public startBatchUpdateWorker() {
        if (this.isWorkerRunning) return;
        this.isWorkerRunning = true;

        this.batchUpdateWorker = setInterval(async () => {
            await this.processQueueTick();
        }, this.workerIntervalMs);
    }

    public async stopBatchUpdateWorker() {
        if (this.batchUpdateWorker) {
            clearInterval(this.batchUpdateWorker);
            this.batchUpdateWorker = undefined;
        }
        this.isWorkerRunning = false;

        console.log("[GoogleSheetsService-Worker] Stopping worker... Flushing remaining queue...");

        // Якщо воркер зараз виконує активний запит — чекаємо, поки він завершиться
        while (this.isProcessingBatch) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Якщо після цього в черзі ще щось залишилося (або поки чекали, щось докинули) — 
        // робимо фінальний примусовий злив (flush)
        while (this.updateQueue.size > 0) {
            console.log(`[GoogleSheetsService-Worker] Flushing ${this.updateQueue.size} remaining spreadsheets before shutdown...`);
            await this.processQueueTick();

            if (this.updateQueue.size > 0) await new Promise(resolve => setTimeout(resolve, this.workerIntervalMs));
        }

        console.log("[GoogleSheetsService-Worker] Worker stopped successfully and all changes are flushed.");
    }

    /**
     * Отримує сирі значення з таблиці. Дату отримує у вигляді форматованого рядка.
     * @param spreadsheetId ідентифікатор електроної таблиці
     * @param range масив діапазонів або назв аркушів (наприклад, ['Sheet1', 'Sheet2!A1:B10'])
     * @returns діапозон зі значеннями
     */
    async batchGetValues(spreadsheetId: string, ranges: string[]): Promise<sheets_v4.Schema$ValueRange[]> {
        if (!ranges || ranges.length === 0) return [];

        try {
            const response = await this.sheets.spreadsheets.values.batchGet({
                spreadsheetId,
                ranges,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING'
            });

            return response.data.valueRanges || [];
        } catch (error) {
            const rangesStr = ranges.length > 10
                ? `${ranges.slice(0, 10).join(', ')}...`
                : ranges.join(', ');
            console.error(`Cannot read range from Google Sheet. SpreadsheetId: ${spreadsheetId} Range: ${rangesStr}`, error);
            throw error;
        }
    }

    async updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<sheets_v4.Schema$UpdateValuesResponse> {
        try {
            // console.log(`[GoogleSheetsService] - Update Value spreadsheet_id: "${spreadsheetId}" range: "${range}" values:`);
            // console.log(`[GoogleSheetsService] - ${JSON.stringify(values, null, 2)}`);
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Cannot update range. SpreadsheetId: ${spreadsheetId}, Range: ${range}`, error);
            throw error;
        }
    }

    /**
     * Безпечно ставить у чергу оновлення діапазону з автоматичним розширенням сітки за потреби
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор аркуша
     * @param startRowIndex індекс рядка початку діапазону
     * @param endRowIndex індекс рядка закінчення діапазону
     * @param startColumnIndex індекс колонки початку діапазону
     * @param endColumnIndex індекс колонки закінчення діапазону
     */
    public lateUpdateValuesEnsureFit(
        spreadsheetId: string,
        sheetId: number,
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number,
        values: any[][]
    ) {
        // Отримуємо метадані аркуша з нашого реєстру в пам'яті
        const sheetMeta = SpreadsheetMetaRegistry.getSheetMeta(spreadsheetId, sheetId);

        if (sheetMeta) {
            // Перевіряємо, чи виходить кінцевий рядок за поточні межі сітки
            if (endRowIndex > sheetMeta.rowCount) {
                const rowsNeeded = endRowIndex - sheetMeta.rowCount;
                console.log(`[GoogleSheetsService] - Grid limit exceeded! Current rowCount: ${sheetMeta.rowCount}, target endRow: ${endRowIndex}. Appending ${rowsNeeded} rows...`);

                this.lateAppendRows(spreadsheetId, sheetId, rowsNeeded);
            }

            // Аналогічно для колонок, якщо раптом вилітаємо за ширину
            if (endColumnIndex > sheetMeta.columnCount) {
                const colsNeeded = endColumnIndex - sheetMeta.columnCount;
                console.log(`[GoogleSheetsService] - Grid limit exceeded! Current columnCount: ${sheetMeta.columnCount}, target endCol: ${endColumnIndex}. Appending ${colsNeeded} cols...`);

                this.lateAppendColumns(spreadsheetId, sheetId, colsNeeded);
            }
        }

        // Викликаємо звичайний базовий метод запису
        this.lateUpdateValues(
            spreadsheetId,
            sheetId,
            startRowIndex,
            endRowIndex,
            startColumnIndex,
            endColumnIndex,
            values
        );
    }

    /**
     * Ставить у чергу для Батчу на Оновлення діапазон данних
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор аркуша
     * @param startRowIndex індекс рядка початку діапазону
     * @param endRowIndex індекс рядка закінчення діапазону
     * @param startColumnIndex індекс колонки початку діапазону
     * @param endColumnIndex індекс колонки закінчення діапазону
     */
    public lateUpdateValues(
        spreadsheetId: string,
        sheetId: number,
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number,
        values: any[][]): void {
        try {
            const request: sheets_v4.Schema$Request = {
                updateCells: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: startRowIndex,
                        endRowIndex: endRowIndex,
                        startColumnIndex: startColumnIndex,
                        endColumnIndex: endColumnIndex
                    },
                    rows: values.map(row => ({
                        values: row.map(cell => {
                            let extendedValue: sheets_v4.Schema$ExtendedValue;
                            switch (typeof cell) {
                                case "number": {
                                    extendedValue = {
                                        "numberValue": cell
                                    }
                                    break
                                }
                                case "boolean": {
                                    extendedValue = {
                                        "boolValue": cell
                                    }
                                    break
                                }
                                default: {
                                    extendedValue = {
                                        "stringValue": String(cell)
                                    }
                                    break
                                }
                            }

                            return {
                                "userEnteredValue": extendedValue
                            } satisfies sheets_v4.Schema$CellData
                        })
                    })),
                    fields: 'userEnteredValue'
                }
            }

            this.appendRequestToUpdateBatch(spreadsheetId, request);

        } catch (error) {
            console.error(`Cannot update range. SpreadsheetId: ${spreadsheetId}, sheetId: ${sheetId}, startRowIndex: ${startRowIndex}, endRowIndex: ${endRowIndex}, startColumnIndex: ${startColumnIndex}, endColumnIndex: ${endColumnIndex}`, error);
            throw error;
        }
    }

    public lateInsertColumns(spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number) {
        const request: sheets_v4.Schema$Request = {
            insertDimension: {
                range: {
                    sheetId: sheetId,
                    dimension: 'COLUMNS',
                    startIndex: startIndex,
                    endIndex: endIndex
                },
                inheritFromBefore: true
            }
        }

        this.appendRequestToUpdateBatch(spreadsheetId, request);
        SpreadsheetMetaRegistry.addColsLocally(spreadsheetId, sheetId, endIndex - startIndex);
    }

    public lateInsertRowsIndex(
        spreadsheet_id: string,
        sheet_id: number,
        start_index: number,
        end_index: number
    ) {
        const request: sheets_v4.Schema$Request = {
            insertDimension: {
                range: {
                    sheetId: sheet_id,
                    dimension: "ROWS",
                    startIndex: start_index,
                    endIndex: end_index
                },
                inheritFromBefore: true
            },
        }

        this.appendRequestToUpdateBatch(spreadsheet_id, request);
        SpreadsheetMetaRegistry.addRowsLocally(spreadsheet_id, sheet_id, end_index - start_index)
    }

    public moveColumns(
        spreadsheetId: string,
        sheetId: number,
        startIndex: number,
        endIndex: number,
        destinationIndex: number
    ) {
        const request: sheets_v4.Schema$Request = {
            moveDimension: {
                source: {
                    sheetId: sheetId,
                    dimension: 'COLUMNS',
                    startIndex: startIndex,
                    endIndex: endIndex
                },
                destinationIndex: destinationIndex
            }
        }

        this.appendRequestToUpdateBatch(spreadsheetId, request)
    }

    /**
     * Ставить у чергу для батчу очищення вмісту клітинок у діапазоні
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор аркуша
     * @param startRowIndex індекс рядка початку діапазону
     * @param endRowIndex індекс рядка закінчення діапазону
     * @param startColumnIndex індекс колонки початку діапазону
     * @param endColumnIndex індекс колонки закінчення діапазону
     */
    public lateClearContents(
        spreadsheetId: string,
        sheetId: number,
        startRowIndex: number,
        endRowIndex: number,
        startColumnIndex: number,
        endColumnIndex: number
    ) {
        const request: sheets_v4.Schema$Request = {
            updateCells: {
                range: {
                    sheetId,
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex,
                    endColumnIndex,
                },
                fields: "userEnteredValue"
            }
        }

        this.appendRequestToUpdateBatch(spreadsheetId, request);
    }

    /**
     * Ставить у чергу для батчу видалення колонок
     * @param spreadsheet_id ідентифікатор ел.таблиці
     * @param sheet_id ідентифікатор аркуша
     * @param column_index індекс колонки, з якої починається видалення
     * @param how_many кількість колонок, які треба видалити
     */
    public lateDeleteColumns(
        spreadsheet_id: string,
        sheet_id: number,
        column_index: number,
        how_many: number = 1
    ) {
        const request: sheets_v4.Schema$Request = {
            deleteDimension: {
                range: {
                    sheetId: sheet_id,
                    dimension: 'COLUMNS',
                    startIndex: column_index,
                    endIndex: column_index + how_many
                }
            }
        }

        this.appendRequestToUpdateBatch(spreadsheet_id, request);
        SpreadsheetMetaRegistry.removeColsLocally(spreadsheet_id, sheet_id, how_many);
    }

    /**
     * Ставить у чергу для батчу видалення рядків
     * @param spreadsheet_id ідентифікатор ел.таблиці
     * @param sheet_id ідентифікатор аркуша
     * @param row_index індекс рядка, з якого починається видалення
     * @param how_many кількість рядків, які треба видалити
     */
    public async lateDeleteRows(
        spreadsheet_id: string,
        sheet_id: number,
        row_index: number,
        how_many: number = 1
    ) {
        const request: sheets_v4.Schema$Request = {
            deleteDimension: {
                range: {
                    sheetId: sheet_id,
                    dimension: 'ROWS',
                    startIndex: row_index,
                    endIndex: row_index + how_many
                }
            }
        }

        this.appendRequestToUpdateBatch(spreadsheet_id, request);
        SpreadsheetMetaRegistry.removeRowsLocally(spreadsheet_id, sheet_id, how_many)
    }

    /**
     * Ставить у чергу для батчу розширення сітки додаванням рядків
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор аркуша
     * @param howMany кількість рядків, які треба додати
     */
    public lateAppendRows(
        spreadsheetId: string,
        sheetId: number,
        howMany: number
    ) {
        const request: sheets_v4.Schema$Request = {
            appendDimension: {
                sheetId: sheetId,
                dimension: "ROWS",
                length: howMany
            }
        };

        this.appendRequestToUpdateBatch(spreadsheetId, request);
        // Одразу ж проактивно оновлюємо локальний стейт у реєстрі
        SpreadsheetMetaRegistry.addRowsLocally(spreadsheetId, sheetId, howMany);
    }

    /**
     * Ставить у чергу для батчу розширення сітки додаванням колонок
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор аркуша
     * @param howMany кількість колонок, які треба додати
     */
    public lateAppendColumns(
        spreadsheetId: string,
        sheetId: number,
        howMany: number
    ) {
        const request: sheets_v4.Schema$Request = {
            appendDimension: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                length: howMany
            }
        };

        this.appendRequestToUpdateBatch(spreadsheetId, request);
        SpreadsheetMetaRegistry.addColsLocally(spreadsheetId, sheetId, howMany);
    }

    /**
     * Ставить у чергу для батчу додавання нового аркуша
     * @param spreadsheet_id ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор, який треба присвоїти новому аркушу
     * @param title назва нового аркуша
     * @param index індекс, на який треба вставити новий аркуш
     */
    public lateInsertSheet(
        spreadsheet_id: string,
        sheetId: number,
        title: string,
        index: number
    ) {
        const request: sheets_v4.Schema$Request = {
            addSheet: {
                properties: {
                    sheetId: sheetId,
                    title: title,
                    index: index
                }
            }
        }

        this.appendRequestToUpdateBatch(spreadsheet_id, request);
        SpreadsheetMetaRegistry.registerSheetLocally(
            spreadsheet_id,
            sheetId,
            title,
            GoogleSheetsService.DEFAULT_NEW_SHEET_ROW_COUNT,
            GoogleSheetsService.DEFAULT_NEW_SHEET_COLUMN_COUNT
        );
    }

    /**
     * Ставить у чергу для батчу дублювання аркуша
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sourceSheetId ідентифікатор аркуша-джерела, який треба дублювати
     * @param insertSheetIndex індекс, на який треба вставити новий (дубльований) аркуш
     * @param newSheetId ідентифікатор, який треба присвоїти новому аркушу
     * @param newSheetName назва нового аркуша
     */
    public lateDuplicateSheet(
        spreadsheetId: string,
        sourceSheetId: number,
        insertSheetIndex: number,
        newSheetId: number,
        newSheetName: string
    ) {
        const request: sheets_v4.Schema$Request = {
            duplicateSheet: {
                sourceSheetId: sourceSheetId,
                insertSheetIndex: insertSheetIndex,
                newSheetId: newSheetId,
                newSheetName: newSheetName
            }
        }

        this.appendRequestToUpdateBatch(spreadsheetId, request);
        const sourceMeta = SpreadsheetMetaRegistry.getSheetMeta(spreadsheetId, sourceSheetId);
        SpreadsheetMetaRegistry.registerSheetLocally(
            spreadsheetId,
            newSheetId,
            newSheetName,
            sourceMeta?.rowCount ?? GoogleSheetsService.DEFAULT_NEW_SHEET_ROW_COUNT,
            sourceMeta?.columnCount ?? GoogleSheetsService.DEFAULT_NEW_SHEET_COLUMN_COUNT
        );
    }

    /**
     * Повертає загальну інформацію про таблицю
     * @param spreadsheetId ідентифікатор таблиці
     * @returns Схему таблиці
     */
    async getSpreadsheet(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId
            });

            return response.data;
        } catch (error) {
            console.error(`Cannot get Spreadsheet. SpreadsheetId: ${spreadsheetId}`);
            throw error;
        }
    }
}

export default new GoogleSheetsService();