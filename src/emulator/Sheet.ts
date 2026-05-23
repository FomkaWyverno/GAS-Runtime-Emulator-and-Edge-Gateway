import Database from "../core/database/Database.js";
import { Spreadsheet } from "./Spreadsheet.js";
import { CellEntity, CellValueType } from "./types/cell.entity.js";

export class Sheet {
    constructor(
        private readonly spreadsheet: Spreadsheet,
        private readonly sheet_id: number,
        private sheet_name: string,
        private sheet_index: number,
    ) { }

    /**
     * Returns the name of the sheet.
     * @returns The name of the sheet.
     */
    public getName(): string {
        return this.sheet_name;
    }

    /**
     * Returns the sheet name.
     * @returns The name of the sheet.
     */
    public getSheetName(): string {
        return this.sheet_name;
    }

    /**
     * Внутрішній метод, щоб змінювати індекс розташування у таблиці аркуша.
     * @param sheetIndex новий індекс
     */
    public _setSheetIndex(sheetIndex: number) {
        this.sheet_index = sheetIndex;
    }

    /**
     * Повертає таблицю у якій знаходиться цей аркуш
     * @returns Spreadsheet талбиці у якій знаходиться цей аркуш
     */
    public getParent(): Spreadsheet {
        return this.spreadsheet;
    }

    /**
     * Returns the ID of the sheet represented by this object.
     * This is an ID for the sheet that is unique to the spreadsheet.
     * The ID is a monotonically increasing integer assigned at sheet creation time that is independent of sheet position.
     * This is useful in conjunction with methods such as Range.copyFormatToRange(gridId, column, columnEnd, row, rowEnd) that take a gridId parameter rather than a Sheet instance.
     * @returns An ID for the sheet unique to the spreadsheet.
     */
    public getSheetId(): number {
        return this.sheet_id;
    }

    /**
     * Gets the position of the sheet in its parent spreadsheet. Starts at 1.
     * @returns The position of the sheet in its parent spreadsheet.
     */
    public getIndex(): number {
        return this.sheet_index;
    }

    /**
     * Returns the position of the last row that has content.
     * @returns The last row of the sheet that contains content.
     */
    public getLastRow(): number {
        const sql = 'SELECT MAX(row) as max_row FROM `cells` WHERE `spreadsheet_id` = ? AND `sheet_id` = ?;';
        const result = Database.query<{ max_row: number }>(sql, [this.getParent().getId(), this.getSheetId()]);

        return result?.[0]?.max_row ?? 0;
    }

    /**
     * Returns the position of the last column that has content.
     * @returns The last column of the sheet that contains content.
     */
    public getLastColumn(): number {
        const sql = 'SELECT MAX(col) as max_col FROM `cells` WHERE `spreadsheet_id` = ? AND `sheet_id` = ?;';
        const result = Database.query<{ max_col: number }>(sql, [this.getParent().getId(), this.getSheetId()]);

        return result?.[0]?.max_col ?? 0;
    }

    /**
     * Appends a row to the bottom of the current data region in the sheet.
     * If a cell's content begins with =, it's interpreted as a formula.
     * @param rowContents 
     * @returns The sheet, useful for method chaining.
     */
    public appendRow(rowContents: Object[]): Sheet {

        const nextRow = this.getLastRow() + 1;

        const cellsToInsert: CellEntity[] = rowContents.map((rawValue, idx) => {
            const col = idx + 1; // Додаємо +1, щоб відповідати стандарту Google Sheet де колонка починається з 1.

            if (rawValue === undefined || rawValue === null) {
                const nullCell: CellEntity = {
                    spreadsheet_id: this.getParent().getId(),
                    sheet_id: this.getSheetId(),
                    row: nextRow,
                    col: col,
                    value: null,
                    value_type: "NULL"
                }
            }

            let valueType: CellValueType = 'STRING';
            const typeValue = typeof rawValue;
            if (typeValue === 'number') {
                valueType = 'NUMBER'
            } else if (typeValue === 'boolean') {
                valueType = 'BOOLEAN'
            }

            const value: CellEntity = {
                spreadsheet_id: this.getParent().getId(),
                sheet_id: this.getSheetId(),
                row: nextRow,
                col: col,
                value: String(rawValue),
                value_type: valueType
            }

            return value;
        });

        this.upsertCellsBulk(cellsToInsert);

        return this;
    }


    /**
     * Deletes a number of columns starting at the given column position.
     * Columns start at "1" - this deletes the first column
     * @param columnPosition The position of the first column to delete.
     * @param howMany The number of columns to delete.
     * @returns The sheet, useful for method chaining.
     */
    public deleteColumn(columnPosition: number, howMany: number = 1): Sheet {
        if (columnPosition < 1) throw new Error(`Columns cannot be less 1. ColumnPosition: ${columnPosition}`);
        if (howMany < 1) return this;

        return Database.transaction(() => {
            const deleteSQL = `
                DELETE FROM \`cells\`
                WHERE \`spreadsheet_id\` = ? 
                    AND \`sheet_id\` = ?
                    AND \`col\` >= ?
                    AND \`col\` < ?;
            `;
            Database.query(deleteSQL, [this.getParent().getId(), this.getSheetId(), columnPosition, columnPosition + howMany]);

            const updateSQL = `
                UPDATE \`cells\`
                SET \`col\` = \`col\` - ?
                WHERE \`spreadsheet_id\` = ?
                    AND \`sheet_id\` = ?
                    AND \`col\` >= ?;
            `;
            Database.query(updateSQL, [howMany, this.getParent().getId(), this.getSheetId(), columnPosition + howMany]);

            return this;
        });
    }

    /**
     * Deletes a number of rows starting at the given row position.
     * Rows start at "1" - this deletes the first two rows
     * @param rowPosition The position of the first row to delete.
     * @param howMany The number of rows to delete.
     * @returns The sheet, useful for method chaining.
     */
    public deleteRows(rowPosition: number, howMany: number = 1): Sheet {
        if (rowPosition < 1) throw new Error(`Row cannot be less 1. RowPosition: ${rowPosition}`);
        if (howMany < 1) return this;

        return Database.transaction(() => {
            const deleteSQL = `
                DELETE FROM \`cells\`
                WHERE \`spreadsheet_id\` = ?
                    AND \`sheet_id\` = ?
                    AND \`row\` >= ?
                    AND \`row\` < ?; 
            `;

            Database.query(deleteSQL, [this.getParent().getId(), this.getSheetId(), rowPosition, rowPosition + howMany]);

            const updateSQL = `
                UPDATE \`cells\`
                SET \`row\` = \`row\` - ?
                WHERE \`spreadsheet_id\` = ?
                    AND \`sheet_id\` = ?
                    AND \`row\` >= ?;
            `;

            Database.query(updateSQL, [howMany, this.getParent().getId(), this.getSheetId(), rowPosition + howMany]);

            return this;
        });
    }

    /**
     * Записує у бд, всі комірки одним товстим запитом
     * @param cells Комірки які потрібно вставати/оновити в аркуші
     * @returns 
     */
    private upsertCellsBulk(cells: CellEntity[]): void {
        if (cells.length === 0) return;

        const CHUNK_SIZE = 1000;

        for (let i = 0; i < cells.length; i += CHUNK_SIZE) {
            const chunk = cells.slice(i, i + CHUNK_SIZE)

            const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const sql = `
                INSERT INTO \`cells\` (spreadsheet_id, sheet_id, row, col, value, value_type)
                VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE
                    value = VALUES(value),
                    value_type = VALUES(value_type);
            `;

            const flatValues = chunk.reduce((acc, cell) => {
                acc.push(cell.spreadsheet_id, cell.sheet_id, cell.row, cell.col, cell.value, cell.value_type);
                return acc;
            }, [] as any[]);

            Database.query(sql, flatValues);
        }
    }
}