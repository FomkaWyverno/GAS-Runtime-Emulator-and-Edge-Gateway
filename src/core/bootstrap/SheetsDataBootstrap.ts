import { sheets_v4 } from "googleapis";
import AppConfig from "../config/AppConfig.js";
import GoogleSheetsService from "../service/GoogleSheetsService.js";
import { BootStrap } from "./Bootstrap.js";
import { asyncPool } from "../helpers/asyncPool.js";


class SheetsDataBootstrap implements BootStrap {
    public async boot() {
        const spreadsheetId = AppConfig.sync.spreadsheetdId;
        const sheetNames = AppConfig.sync.sheets;

        if (!sheetNames || !Array.isArray(sheetNames)) throw new Error('Config sync.sheets miss or is not array with sheets');
        if (!spreadsheetId || typeof spreadsheetId !== 'string') throw new Error('Confy sync.spreadsheetId miss or is not string');

        const sheetNameSet = new Set(sheetNames);

        const spreadsheet = await GoogleSheetsService.getSpreadsheet(spreadsheetId);

        // Аркуші з даними які потрібно для запуску емулятора
        const dataSheets = spreadsheet.sheets
            ?.filter(sheet => sheetNameSet.has(sheet.properties?.title ?? ''))
            ?? [];

        // Якщо таблиця має не таку кількість аркушів як у конфігу, тоді сповіщаємо про помилку
        if (dataSheets.length !== sheetNameSet.size) throw new Error('Data sheets do not equal to size configuration sheets sync');

        const valueSheets = await asyncPool(dataSheets, 5, async dataSheet => { 
            const title = dataSheet.properties?.title!;
            
            const valueRange = await GoogleSheetsService.getValues(spreadsheetId, title);
            return {
                title,
                valueRange
            }
        });
    
        // TODO: Доробити витягування данних з таблиці до баз данних.
        // TODO: Зробити великий один запит, щоб вставити всі дані з таблиці у БД

    }
}

export default new SheetsDataBootstrap();