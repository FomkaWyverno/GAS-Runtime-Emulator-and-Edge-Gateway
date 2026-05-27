import { Sheet } from "./Sheet.js";

export class Range {
    constructor(
        private readonly sheet: Sheet,
        private readonly row: number,
        private readonly column: number,
        private readonly numRows: number,
        private readonly numColumns: number) {}

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

    
}