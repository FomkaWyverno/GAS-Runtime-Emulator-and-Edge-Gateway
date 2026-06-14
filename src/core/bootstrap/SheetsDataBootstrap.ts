import { sheets_v4 } from "googleapis";
import AppConfig from "../config/AppConfig.js";
import GoogleSheetsService from "../service/GoogleSheetsService.js";
import { BootStrap } from "./Bootstrap.js";
import { asyncPool } from "../helpers/asyncPool.js";
import Database from "../database/Database.js";
import { CellValueType } from "../../emulator/@types/sheets/cell.entity.js";

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
        const spreadsheetId = AppConfig.sync.spreadsheetId;
        const sheetNames = AppConfig.sync.sheets;

        if (!sheetNames || !Array.isArray(sheetNames)) throw new Error('Config sync.sheets miss or is not array with sheets');
        if (!spreadsheetId || typeof spreadsheetId !== 'string') throw new Error('Confy sync.spreadsheetId miss or is not string');

        const sheetNameSet = new Set(AppConfig.sync.sheets);
        // Аркуші з даними які потрібно для запуску емулятора
        const dataSheets = await this.getDataSheets(sheetNameSet);

        // Якщо таблиця має не таку кількість аркушів як у конфігу, тоді сповіщаємо про помилку
        if (dataSheets.length !== sheetNameSet.size) throw new Error('Data sheets do not equal to size configuration sheets sync');

        const valueSheets: SheetValues[] = await this.pullSheetsValues(dataSheets);
        if (valueSheets.length === 0) return;

        this.createSheetToDatabase(dataSheets);
        this.bulkInsertSheetsValuesToDatabase(valueSheets);
        // TODO: Доробити витягування данних з таблиці до баз данних.
        // TODO: Зробити великий один запит, щоб вставити всі дані з таблиці у БД

    }

    /**
     * @param sheetNameSet назви таблиць які потрібно перевірити чи є у електроній таблиці ці назви аркушів
     * @returns Повертає таблиці які є в конфігурації, та є в електроній таблиці
     */
    private async getDataSheets(sheetNameSet: Set<string>): Promise<sheets_v4.Schema$Sheet[]> {
        const spreadsheet = await GoogleSheetsService.getSpreadsheet(AppConfig.sync.spreadsheetId);

        // Аркуші з даними які потрібно для запуску емулятора
        return spreadsheet.sheets
            ?.filter(sheet => sheetNameSet.has(sheet.properties?.title ?? ''))
            ?? [];
    }

    /**
     * Витягує всі значення з таблиці та повертає одним массивом
     * @param sheets таблиці які потрібно витягнути всі дані
     * @param asyncPoolSize кількість одночасних запитів до АПІ
     * @returns массив з даними таблиць
     */
    private async pullSheetsValues(sheets: sheets_v4.Schema$Sheet[], asyncPoolSize: number = 5): Promise<SheetValues[]> {
        return await asyncPool(sheets, asyncPoolSize, async sheet => {
            const title = sheet.properties?.title!;

            const valueRange = await GoogleSheetsService.getValues(AppConfig.sync.spreadsheetId, title);

            return { spreadsheetId: AppConfig.sync.spreadsheetId, sheetId: sheet.properties?.sheetId!, title, valueRange }
        });
    }

    /**
     * Створює записи для табличок
     * @param sheets таблички які потрібно записати у базі даних
     */
    private createSheetToDatabase(sheets: sheets_v4.Schema$Sheet[]) {
        const placeholders = sheets.map(() => '(?, ?, ?, ?)').join(', ');
        const sql = `
            INSERT INTO \`sheets\` (sheet_id, spreadsheet_id, \`name\`, sheet_index)
                VALUES ${placeholders};
        `;

        const flatValues = sheets.reduce((acc, sheet) => {
            const sheetProp = sheet.properties!;
            acc.push(sheetProp.sheetId, AppConfig.sync.spreadsheetId, sheetProp.title, sheetProp.index);
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
                            value_type: this.getCellType(cell)
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
                    return acc; // TODO Доробити вставку індекси
                }, [] as any[]);

                Database.query(sql, flatValues)
            }
        });


    }

    private getCellType(value: any): CellValueType {
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') return 'NUMBER';

        const isDate = !isNaN(Date.parse(value)) && isNaN(Number(value));
        if (isDate) return 'DATE';

        return 'STRING';
    }
}

export default new SheetsDataBootstrap();