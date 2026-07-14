import Database from "../../core/database/Database.js";
import { Sheet } from "./Sheet.js";
import { CellEntity, CellValueType } from "../@types/sheets/cell.entity.js";
import GasEventEmitter from "../../core/events/GasEventEmitter.ts";
import { Cell } from "../@types/sheets/cell.js";

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

        return this.parseCellValue(cell.value, cell.value_type);
    }

    
    /**
     * Returns the rectangular grid of values for this range.
     * Returns a two-dimensional array of values, indexed by row, then by column.
     * The values may be of type Number, Boolean, Date, or String, depending on the value of the cell.
     * Empty cells are represented by an empty string in the array. Remember that while a range index starts at 1, 1, the JavaScript array is indexed from [0][0].
     * @returns A two-dimensional array of values.
     */
    public getValues(): Array<Array<number | boolean | Date | string>> {
        const endRow = this.getRow() + this.getNumRows() - 1;
        const endColumn = this.getColumn() + this.getNumColumns() - 1;

        const matrix: Array<Array<number | boolean | Date | string>> = Array.from(
            { length: this.getNumRows() },
            () => Array(this.numColumns).fill('')
        );

        const sql = `
            SELECT col, \`row\`, \`value\`, value_type FROM cells
            WHERE spreadsheet_id = ? AND sheet_id = ?
                AND \`row\` BETWEEN ? AND ?
                AND col BETWEEN ? AND ?;
        `;

        const cells = Database.query<Pick<CellEntity, 'col' | 'row' | 'value' | 'value_type'>>(sql, [
            this.getSheet().getParent().getId(),
            this.getSheet().getSheetId(),
            this.getRow(),
            endRow,
            this.getColumn(),
            endColumn
        ]);

        for (const cell of cells) {
            const rowIndex = cell.row - this.getRow();
            const colIndex = cell.col - this.getColumn();

            matrix[rowIndex][colIndex] = this.parseCellValue(cell.value, cell.value_type);
        }

        return matrix;
    }

    /**
     * Sets a rectangular grid of values (must match dimensions of this range). If a value begins with =, it's interpreted as a formula.
     * @param values A two-dimensional array of values.
     * @returns This range, for chaining.
     */
    public setValues(values: Array<Array<number | boolean | Date | string>>): Range {
        if (!Array.isArray(values) || values.length !== this.getNumRows()) {
            throw new Error(`The number of rows in the data does not match the number of rows in the range. Expected ${this.getNumRows()}`);
        }

        const bindValues: any[] = [];
        const valuePlaceholders: string[] = [];

        const spreadsheetId = this.getSheet().getParent().getId();
        const sheetId = this.getSheet().getSheetId();

        const cellMatrix: Cell[][] = [];

        for (let r = 0; r < this.getNumRows(); r++) {
            const rowData = values[r];

            if (!Array.isArray(rowData) || rowData.length !== this.numColumns) {
                throw new Error(`The number of columns in row ${r} does not match num columns in range. Expected ${this.getNumColumns()}, but got ${rowData?.length}`);
            }

            const actualRow = this.getRow() + r;

            cellMatrix.push([]);

            for (let c = 0; c < this.getNumColumns(); c++) {
                const actualCol = this.getColumn() + c;
                const rawValue = rowData[c];

                const { value, value_type } = this.determinateValueAndType(rawValue);

                valuePlaceholders.push('(?, ?, ?, ?, ?, ?)');

                bindValues.push(
                    spreadsheetId,
                    sheetId,
                    actualRow,
                    actualCol,
                    value,
                    value_type
                );

                cellMatrix[cellMatrix.length - 1].push({
                    value: value,
                    value_type: value_type
                });
            }
        }

        if (valuePlaceholders.length === 0) return this;

        const sql = `
            INSERT INTO cells (spreadsheet_id, sheet_id, \`row\`, \`col\`, \`value\`, value_type)
            VALUES ${valuePlaceholders.join(', ')}
            ON DUPLICATE KEY UPDATE
                \`value\` = VALUES(\`value\`),
                value_type = VALUES(value_type);
        `;

        Database.query(sql, bindValues);

        GasEventEmitter.emit('onUpdateRange', {
            spreadsheet_id: spreadsheetId,
            sheet_id: sheetId,
            row: this.row,
            col: this.column,
            cells: cellMatrix
        });

        return this;
    }

    private parseCellValue(rawValue: string | null | undefined, valueType: CellValueType): number | boolean | Date | string {
        if (rawValue === null || rawValue === undefined || rawValue === '') return '';

        switch(valueType) {
            case "STRING": { 
                return rawValue;
            }

            case "NUMBER": { 
                const num = Number(rawValue);
                return isNaN(num) ? '' : num;
            }

            case "BOOLEAN": {
                const strLower = String(rawValue).toLowerCase().trim();
                return !(strLower === 'false' || strLower === '0' || strLower === '');
            } 

            case "DATE": {
                const date = new Date(rawValue);
                return isNaN(date.getTime()) ? '' : date;
            }

            default: return '';
        }
    }

    private determinateValueAndType(val: number | boolean | Date | string): Cell {
        if (val === null || val === undefined || val === '') {
            return { value: '', value_type: 'STRING' }
        }

        if (typeof val === 'boolean') {
            return { value: val ? 'TRUE' : 'FALSE', value_type: 'BOOLEAN' }
        }

        if (typeof val === 'number') {
            return { value: String(val), value_type: 'NUMBER' }
        }

        if (val instanceof Date) {
            return { value: val.toISOString(), value_type: 'DATE' }
        }

        return { value: String(val), value_type: 'STRING' }
    }
}