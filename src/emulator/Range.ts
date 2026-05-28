import Database from "../core/database/Database.js";
import { Sheet } from "./Sheet.js";
import { CellEntity } from "./types/cell.entity.js";

export class Range {
    constructor(
        private readonly sheet: Sheet,
        private readonly row: number,
        private readonly column: number,
        private readonly numRows: number,
        private readonly numColumns: number) { }

    /**
     * Returns the starting column position for this range
     * @returns The range's starting column position in the spreadsheet.
     */
    public getColumn(): number {
        return this.column;
    }

    /**
     * Returns the row position for this range. Identical to getRowIndex().
     * @returns The row position of the range.
     */
    public getRow(): number {
        return this.row;
    }

    /**
     * Returns the number of rows in this range.
     * @returns The number of rows in this range.
     */
    public getNumRows(): number {
        return this.numRows;
    }

    /**
     * Returns the number of columns in this range.
     * @returns The number of columns in this range.
     */
    public getNumColumns(): number {
        return this.numColumns;
    }

    /**
     * Returns the sheet this range belongs to.
     * @returns The sheet that this range belongs to.
     */
    public getSheet(): Sheet {
        return this.sheet;
    }

    /**
     * Returns the value of the top-left cell in the range.
     * The value may be of type Number, Boolean, Date, or String depending on the value of the cell.
     * Empty cells return an empty string.
     * @returns The value in this cell.
     */
    public getValue(): number | boolean | Date | string {
        const sql = `
            SELECT \`value\`, value_type FROM cells
            WHERE spreadsheet_id = ? AND sheet_id = ?
            AND col = ? AND \`row\` = ?
            LIMIT 1;
        `;

        const result = Database
            .query<Pick<CellEntity, 'value' | 'value_type'>>(
                sql,
                [
                    this.getSheet().getParent().getId(),
                    this.getSheet().getSheetId(),
                    this.getColumn(),
                    this.getRow()
                ]);

        const cell = result[0];
        if (!cell) return '';

        switch(cell.value_type) {
            case "STRING": { 
                return cell.value;
            }

            case "NUMBER": { 
                const num = Number(cell.value);
                return isNaN(num) ? '' : num;
            }
            
            case "BOOLEAN": {
                const strLower = String(cell.value).toLowerCase().trim();
                return !(strLower === 'false' || strLower === '0' || strLower === '');
            } 

            case "DATE": {
                const date = new Date(cell.value);
                return isNaN(date.getTime()) ? '' : date;
            }

            default: return '';
        }
    }
}