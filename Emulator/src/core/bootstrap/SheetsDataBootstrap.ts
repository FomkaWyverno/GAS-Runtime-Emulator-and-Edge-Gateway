import { sheets_v4 } from "googleapis";
import AppConfig from "../config/AppConfig.js";
import GoogleSheetsService from "../service/GoogleSheetsService.js";
import { BootStrap } from "./Bootstrap.js";
import { asyncPool } from "../helpers/asyncPool.js";
import Database from "../database/Database.js";
import { CellValueType } from "../../emulator/@types/sheets/cell.entity.js";
import CellUtil from "../utils/CellUtil.ts";

interface SheetValues {
    spreadsheetId: string;
    sheetId: number;
    title: string;
    valueRange: sheets_v4.Schema$ValueRange
}

interface CellValue {
    value: any;
    row: number;
    col: number;
    value_type: CellValueType
}

class SheetsDataBootstrap implements BootStrap {
    public async boot() {
        const spreadsheetIDs = Object.keys(AppConfig.sync_sheets);

        for (const spreadsheetId of spreadsheetIDs) {
            const sheetNames = AppConfig.sync_sheets[spreadsheetId];
            if (!sheetNames || !Array.isArray(sheetNames)) throw new Error(`Config sync_sheets.${spreadsheetId} miss or is not array with sheets`);
            if (!spreadsheetId || typeof spreadsheetId !== 'string') throw new Error(`Confy sync.${spreadsheetId} miss or is not string`);

            const sheetNameSet = new Set(sheetNames);

            console.log(`[SheetsDataBootstrap] - Collect sheets with data from Google Sheet according to the configuration`);
            console.log(`[SheetsDataBootstrap] - Collect sheets for ${spreadsheetId}`)
            // Аркуші з даними які потрібно для запуску емулятора
            const existsSheetNames = await this.getExistingSheets(spreadsheetId, sheetNameSet);

            // Якщо таблиця має не таку кількість аркушів як у конфігу, тоді сповіщаємо про помилку
            if (existsSheetNames.length !== sheetNameSet.size) throw new Error('Data sheets do not equal to size configuration sheets sync');

            console.log(`[SheetsDataBootstrap] - Pull out data from sheets`)
            const valueSheets: SheetValues[] = await this.pullSheetsValues(spreadsheetId, existsSheetNames);
            if (valueSheets.length === 0) {
                console.log(`[SheetsDataBootstrap] - No has values! SpreadsheetId: ${spreadsheetId}`);
                continue;
            }
            console.log(`[SheetsDataBootstrap] - Create sheets in database`)
            this.createSheetToDatabase(spreadsheetId, existsSheetNames);
            console.log(`[SheetsDataBootstrap] - Insertions data from sheets to Database`);
            this.bulkInsertSheetsValuesToDatabase(valueSheets);
        }
    }

    /**
     * @param spreadsheetId ідентифікатор таблиці
     * @param sheetNameSet назви таблиць які потрібно перевірити чи є у електроній таблиці ці назви аркушів
     * @returns Повертає таблиці які є в конфігурації, та є в електроній таблиці
     */
    private async getExistingSheets(spreadsheetId: string, sheetNameSet: Set<string>): Promise<sheets_v4.Schema$Sheet[]> {
        const spreadsheet = await GoogleSheetsService.getSpreadsheet(spreadsheetId);

        // Аркуші з даними які потрібно для запуску емулятора
        return spreadsheet.sheets
            ?.filter(sheet => sheetNameSet.has(sheet.properties?.title ?? ''))
            ?? [];
    }

    /**
     * Витягує всі значення з таблиці та повертає одним массивом
     * @param spreadsheetId ідентифікатор таблиці який потрібно витягнути аркуші
     * @param sheets таблиці які потрібно витягнути всі дані
     * @param asyncPoolSize кількість одночасних запитів до АПІ
     * @returns массив з даними таблиць
     */
    private async pullSheetsValues(spreadsheetId: string, sheets: sheets_v4.Schema$Sheet[], asyncPoolSize: number = 5): Promise<SheetValues[]> {
        return await asyncPool(sheets, asyncPoolSize, async sheet => {
            const title = sheet.properties?.title!;

            const valueRange = await GoogleSheetsService.getValues(spreadsheetId, title);

            return { spreadsheetId: spreadsheetId, sheetId: sheet.properties?.sheetId!, title, valueRange }
        });
    }

    /**
     * Створює записи для табличок
     * @param spreadsheetId ідентифікатор ел. таблиці
     * @param sheets таблички які потрібно записати у базі даних
     */
    private createSheetToDatabase(spreadsheetId: string, sheets: sheets_v4.Schema$Sheet[]) {
        const placeholders = sheets.map(() => '(?, ?, ?, ?)').join(', ');
        const sql = `
            INSERT INTO \`sheets\` (sheet_id, spreadsheet_id, \`name\`, sheet_index)
                VALUES ${placeholders};
        `;

        const flatValues = sheets.reduce((acc, sheet) => {
            const sheetProp = sheet.properties!;
            acc.push(sheetProp.sheetId, spreadsheetId, sheetProp.title, sheetProp.index);
            return acc;
        }, [] as any[]);

        Database.query(sql, flatValues);
    }

    private bulkInsertSheetsValuesToDatabase(sheetsValues: SheetValues[], chunk_size: number = 1000) {
        if (sheetsValues.length === 0) return;

        sheetsValues.forEach(sheetValues => {
            const values: CellValue[] = sheetValues.valueRange.values?.flatMap((row, rowIndex) =>
                row.reduce((acc, cell, colIndex) => {
                    // Якщо комірка порожня (null, undefined або ""), взагалі не пушимо її в базу
                    if (cell !== null && cell !== undefined && cell !== "") {
                        acc.push({
                            value: cell,
                            row: rowIndex + 1,
                            col: colIndex + 1,
                            value_type: CellUtil.getCellType(cell)
                        });
                    }
                    return acc;
                }, [] as CellValue[])
            ) ?? [];

            for (let i = 0; i < values.length; i += chunk_size) {
                const chunk = values.slice(i, i + chunk_size);

                const placeholders = chunk.map(() => `(?, ?, ?, ?, ?, ?)`).join(', ');
                const sql = `
                INSERT INTO \`cells\` (spreadsheet_id, sheet_id, \`row\`, col, \`value\`, value_type)
                VALUES ${placeholders};
            `;

                const flatValues = chunk.reduce((acc, cell) => {
                    acc.push(sheetValues.spreadsheetId, sheetValues.sheetId, cell.row, cell.col, cell.value, cell.value_type)
                    return acc;
                }, [] as any[]);

                Database.query(sql, flatValues)
            }
        });
    }
}

export default new SheetsDataBootstrap();