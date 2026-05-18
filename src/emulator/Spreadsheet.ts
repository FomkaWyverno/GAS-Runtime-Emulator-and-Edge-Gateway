import Database from "../core/database/Database.js";
import { Sheet } from "./Sheet.js";

interface SheetEntity {
    sheet_id: number;
    name: string;
}

export class Spreadsheet {
    private readonly sheetMap: Map<number, Sheet> = new Map();
    private isLoaded = false;;

    constructor(
        private readonly id: string
    ) {}

    private getSheetFromEntity(entity: SheetEntity | undefined): Sheet | null {
        return entity !== undefined ? new Sheet(entity.sheet_id, entity.name) : null
    }

    private loadSheetsIfNeeded(): void {
        if (this.isLoaded) return;

        const sql = 'SELECT `sheet_id`, `name` FROM `sheets` WHERE `spreadsheet` = ? ORDER BY `sheet_index` ASC;';
        const entities = Database.query<SheetEntity>(sql, [this.getId()]);

        for (const entity of entities) {
            const sheet = this.getSheetFromEntity(entity);
            if (sheet) {
                this.sheetMap.set(entity.sheet_id, sheet);
            }
        }

        this.isLoaded = true;
    }

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
     * @param name The name of the sheet to get.
     * @returns The sheet with the given name, or null if no sheet is found.
     */
    public getSheetByName(name: string): Sheet | null {
        this.loadSheetsIfNeeded();
        for (const sheet of this.sheetMap.values()) {
            if (sheet.getName() === name) return sheet;
        }
        return null;
    }

    /**
     * Gets the sheet with the given ID. Use Sheet.getSheetId().
     * @param id The ID of the sheet to get.
     * @returns The sheet with the given ID or null if no sheet is found.
     */
    public getSheetById(id: number): Sheet | null {
        this.loadSheetsIfNeeded();
        const sheet = this.sheetMap.get(id);
        return sheet !== undefined ? sheet : null;
    }

    /**
     * Gets all the sheets in this spreadsheet.
     * @returns  An array of all the sheets in the spreadsheet.
     */
    public getSheets(): Sheet[] {
        this.loadSheetsIfNeeded();
        return [...this.sheetMap.values()]
    }
}