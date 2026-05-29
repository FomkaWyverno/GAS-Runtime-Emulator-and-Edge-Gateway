import Database from "../../core/database/Database.js";
import { Spreadsheet } from "./Spreadsheet.js";
import configData from '../../../config.json' with { type: 'json' }
import { AppConfig } from "../../@types/AppConfig.js";

const config = configData as unknown as AppConfig;

export class SpreadsheetApp {
    private static spreadsheetMap = new Map<string, Spreadsheet>();

    /**
     * Opens the spreadsheet with the given ID.
     * A spreadsheet ID can be extracted from its URL.
     * For example, the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
     * @param id The unique identifier for the spreadsheet.
     * @returns The Spreadsheet object with the given id.
     */
    public static openById(id: string): Spreadsheet {
        const cacheSpreadsheet = SpreadsheetApp.spreadsheetMap.get(id);
        if (cacheSpreadsheet) return cacheSpreadsheet;
        
        const sql = 'SELECT EXISTS (SELECT 1 FROM `sheets` WHERE `spreadsheet_id` = ? LIMIT 1) AS `exists`;';
        const result = Database.query<{ exists: number }>(sql, [id]);
        const isSpreadsheetExists = Boolean(result[0]?.exists);

        if (isSpreadsheetExists) {
            const spreadsheet = new Spreadsheet(id);
            SpreadsheetApp.spreadsheetMap.set(id, spreadsheet);
            return spreadsheet;
        }

        throw new Error(`Spreadsheet with id: ${id} not exists!`);
    }

    /**
     * Returns the currently active spreadsheet, or null if there is none.
     * Functions that are run in the context of a spreadsheet can get a reference to the corresponding Spreadsheet object by calling this function.
     * @returns The active Spreadsheet object.
     */
    public static getActive(): Spreadsheet {
        const activeId = config.gas?.activeSpreadsheetId;

        if (!activeId) throw new Error('Missing configuration ActiveSpreadsheetId');

        return SpreadsheetApp.openById(activeId);
    }

    /**
     * GAS Emulator strictly throws error for UI methods, as we run in headless environment.
     */
    public static getUi(): void {
        throw new Error("GAS Emulator not support UI");
    }

    public static flush(): void {
        return; // Заглушка
    }
}