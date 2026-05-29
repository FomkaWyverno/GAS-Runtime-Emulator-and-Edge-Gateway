import Database from "../../core/database/Database.js";
import { Sheet } from "./Sheet.js";
import crypto from 'crypto'

interface SheetEntity {
    sheet_id: number;
    sheet_index: number;
    name: string;
}

interface InsertSheetOptions {
    template: Sheet;
}

interface InsertSheetArguments {
    sheetIndex: number | null;
    sheetName: string | null;
    options: InsertSheetOptions | null;
}

export class Spreadsheet {
    private readonly sheetMap: Map<number, Sheet> = new Map();
    private isLoaded = false;;

    constructor(
        private readonly id: string
    ) { }

    private getSheetFromEntity(entity: SheetEntity | undefined): Sheet | null {
        return entity !== undefined ? new Sheet(this, entity.sheet_id, entity.name, entity.sheet_index) : null// TODO: Доробити
    }

    private loadSheetsIfNeeded(): void {
        if (this.isLoaded) return;

        const sql = 'SELECT `sheet_id`, `sheet_index`, `name` FROM `sheets` WHERE `spreadsheet` = ? ORDER BY `sheet_index` ASC;';
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

    public insertSheet(): Sheet;
    public insertSheet(sheetIndex: number): Sheet;
    public insertSheet(sheetIndex: number,  options: InsertSheetOptions): Sheet;
    public insertSheet(options: InsertSheetOptions): Sheet;
    public insertSheet(sheetName: string): Sheet;
    public insertSheet(sheetName: string,   sheetIndex: number): Sheet;
    public insertSheet(sheetName: string,   sheetIndex: number,     options: InsertSheetOptions): Sheet;
    public insertSheet(sheetName: string,   options: InsertSheetOptions): Sheet;
    public insertSheet(...args: any[]): Sheet {
        this.loadSheetsIfNeeded();

        const insertArgs = this.parseInsertSheetArguments(args);

        const sheetName = this.resolveSheetName(insertArgs.sheetName);
        const sheetIndex = this.resolveSheetIndex(insertArgs.sheetIndex);
        const { options } = insertArgs;
    
        this.shiftIndexesIfNeeded(sheetIndex);

        const sheetId = crypto.randomBytes(4).readUInt32BE(0) % 2147483647;
        this.insertNewSheetToDatabase(sheetId, sheetName, sheetIndex);

        if (options?.template && options.template instanceof Sheet) {
            this.copyTemplateCells(sheetId, options.template);
        }

        const newSheet = new Sheet(this, sheetId, sheetName, sheetIndex);
        this.sheetMap.set(sheetId, newSheet);

        return newSheet;
    }

    private parseInsertSheetArguments(args: any[]): InsertSheetArguments {
        const insertArgs: InsertSheetArguments = {
            sheetIndex: null,
            sheetName: null,
            options: null
        }

        if (args.length === 0) return insertArgs;

        switch (typeof args[0]) {
            case "string": {
                insertArgs.sheetName = args[0];
                break;
            }
            case "number": {
                insertArgs.sheetIndex = args[0];
                break;
            }
            case "object": {
                if (args[0] !== null) insertArgs.options = args[0];
                break;
            }
        }

        switch (typeof args[1]) {
            case "number": {
                insertArgs.sheetIndex = args[1];
                break;
            }
            case "object": {
                if (args[1] !== null) insertArgs.options = args[1];
                break;
            }
        }

        if (typeof args[2] === 'object' && args[2] !== null) insertArgs.options = args[2];

        return insertArgs;
    }

    private resolveSheetName(name: string | null): string {
        if (name) return name;
        let counter = this.sheetMap.size + 1;
        let generatedName: string;
        do {
            generatedName = `Sheet-${counter++}`;
        } while (this.getSheetByName(generatedName) !== null);
        return generatedName;
    }

    private resolveSheetIndex(index: number | null): number {
        if (index === null || index < 0 || index > this.sheetMap.size) return this.sheetMap.size;
        return index;
    }

    private shiftIndexesIfNeeded(targetIndex: number): void {
        if (targetIndex >= this.sheetMap.size) return;

        const shiftSQL = 'UPDATE `sheets` SET `sheet_index` = `sheet_index` + 1 WHERE `spreadsheet_id` = ? AND `sheet_index` >= ? ORDER BY `sheet_index` DESC;';
        Database.query(shiftSQL, [this.getId(), targetIndex]);

        for (const sheet of this.sheetMap.values()) {
            if (sheet.getSheetId() >= targetIndex) sheet._setSheetIndex(sheet.getIndex() + 1);
        }
    }

    private insertNewSheetToDatabase(sheetId: number, sheetName: string, sheetIndex: number) {
        const sql = 'INSERT INTO `sheets` (`sheet_id`, `spreadsheet_id`, `name`, `sheet_index`) VALUES (?, ?, ?, ?);';
        Database.query(sql, [sheetId, this.getId(), sheetName, sheetIndex]);
    }

    private copyTemplateCells(newSheetId: number, template: Sheet): void {
        const sql = `
            INSERT INTO \`cells\` (\`spreadsheet_id\`, \`sheet_id\`, \`row\`, \`col\`, \`value\`, \`value_type\`)
            SELECT \`spreadsheet_id\`, ?, \`row\`, \`col\`, \`value\`, \`value_type\`
            FROM \`cells\`
            WHERE \`spreadsheet_id\` = ? AND \`sheet_id\` = ?;
        `;

        Database.query(sql, [newSheetId, template.getParent().getId(), template.getSheetId()])
    }
}