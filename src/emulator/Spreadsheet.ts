import Database from "../core/database/Database.js";
import { Sheet } from "./Sheet.js";

export class Spreadsheet {

    private readonly sheetMap: Map<string, Sheet> = new Map();

    constructor(
        private readonly id: string
    ) {}

    /**
     * Gets a unique identifier for this spreadsheet.
     * A spreadsheet ID can be extracted from its URL.
     * For example, the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
     * @returns The unique ID (or key) for the spreadsheet.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Returns a sheet with the given name.
     * If multiple sheets have the same name, the leftmost one is returned.
     * Returns null if there is no sheet with the given name.
     * @param name 
     * @returns 
     */
    public getSheetByName(name: string): Sheet | null {
        const cacheSheet = this.sheetMap.get(name);
        if (cacheSheet) return cacheSheet;

        const sql = 'SELECT `sheet_id`, `name` WHERE `spreadsheet_id` = ? AND `name` = ? LIMIT 1;';
        const result = Database.query<{sheet_id: number, name: string}>(sql, [this.getId(), name]);

        if (result[0]) {
            const sheet = new Sheet(result[0].sheet_id, result[0].name);
            this.sheetMap.set(name, sheet);
            return sheet;
        } 

        return null;
    }
}